---
title: 'ASP.NET Web Forms — PostBack, ViewState, 그리고 페이지 생명주기'
description: 'Code-Behind 구조로 도는 레거시 .NET 화면을 읽기 위해 알아야 하는 것들. 왜 Page_Load에 IsPostBack 검사가 붙어 있는가.'
topic: 'dotnet'
tags: ['ASP.NET', 'C#', 'WebForms', 'ViewState', '레거시']
created: 2025-12-29
updated: 2026-08-30
status: 'growing'
---

Java/Spring을 주로 다루다 `.aspx`와 `.aspx.cs`로 된 화면을 맡게 되면 구조가 낯설다. Web Forms는 **웹을 데스크톱 애플리케이션처럼 다루려 한 모델**이라 MVC와 전제가 다르다.

## 파일 두 개가 한 쌍

```
ApplicationForm.aspx      ← UI 마크업
ApplicationForm.aspx.cs   ← 서버 코드 (Code-Behind)
```

`.aspx`의 첫 줄이 둘을 묶는다.

```csharp
<%@ Page Language="C#" AutoEventWireup="true" CodeFile="ApplicationForm.aspx.cs"
    Inherits="ApplicationForm" %>
```

## 서버 컨트롤 — `runat="server"`

```csharp
<asp:GridView ID="gvItemList" runat="server" AutoGenerateColumns="False"
    OnSelectedIndexChanged="gvItemList_SelectedIndexChanged">
    <Columns>
        <asp:BoundField DataField="ItemName" HeaderText="항목명" />
        <asp:CommandField ShowSelectButton="True" SelectText="선택" />
    </Columns>
</asp:GridView>

<asp:TextBox ID="txtApplicantName" runat="server"></asp:TextBox>
<asp:Button ID="btnSubmit" runat="server" Text="신청하기" OnClick="btnSubmit_Click" />
```

`runat="server"`가 붙으면 **서버에서 처리되는 컨트롤**이 되고, C# 코드에서 `txtApplicantName.Text`처럼 직접 접근할 수 있다. 최종적으로는 평범한 HTML로 렌더링된다.

`OnClick="btnSubmit_Click"`은 자바스크립트가 아니라 **서버 메서드**를 가리킨다. 버튼을 누르면 페이지가 서버로 통째로 다시 전송된다.

## PostBack — 이 모델의 핵심

**PostBack(재게시)은 페이지 자체를 서버로 다시 보내 재생성하는 것**이다.

```
사용자 동작 → PostBack → 서버 처리 → 페이지 재생성 → 클라이언트 전송
```

버튼 하나를 눌러도, 드롭다운을 바꿔도 화면 전체가 왕복한다. Ajax 이전 시대의 모델이라 그렇다.

여기서 가장 자주 보게 되는 코드가 나온다.

```csharp
protected void Page_Load(object sender, EventArgs e)
{
    if (!IsPostBack)      // 최초 로드일 때만
    {
        BindItemList();   // 목록 바인딩
    }
}
```

**`IsPostBack` 검사를 빼면 버튼을 누를 때마다 목록을 다시 조회한다.** 게다가 사용자가 고른 값이 초기 데이터로 덮여 선택이 풀린다. 레거시 화면에서 "선택이 자꾸 초기화된다"는 증상은 대개 여기다.

## ViewState — 상태를 어떻게 들고 있나

HTTP는 상태가 없는데 PostBack마다 화면의 상태가 유지된다. 두 경로가 있다. 입력 컨트롤의 값은 폼 POST 데이터로 되돌아오고(`IPostBackDataHandler`), POST되지 않는 상태(Label 텍스트, GridView 바인딩 결과 등)를 PostBack 사이에 들고 있는 것이 **ViewState**다. 텍스트박스 값이 유지되는 것까지 ViewState 덕이라고 이해하면 틀린다.

- 페이지 상태를 PostBack 사이에 유지한다
- **숨겨진 필드에 인코딩되어 담겨 클라이언트와 왕복한다**
- `ViewState["key"]`로 직접 넣고 뺄 수 있다

```csharp
protected void gvItemList_SelectedIndexChanged(object sender, EventArgs e)
{
    GridViewRow row = gvItemList.SelectedRow;
    lblSelectedItem.Text = row.Cells[1].Text;
    ViewState["SelectedItemId"] = row.Cells[0].Text;   // 다음 PostBack까지 유지
}
```

주의할 점이 있다.

**ViewState는 클라이언트를 왕복한다.** GridView에 큰 데이터를 담으면 숨은 필드가 수백 KB가 되고 그만큼 매 요청이 무거워진다. 목록이 느리면 ViewState 크기를 먼저 의심한다.

**보안 경계가 아니다.** 기본 설정에서는 MAC으로 위조는 막지만(`EnableViewStateMac`, 4.5.2부터 강제) 암호화는 되지 않아 내용이 읽힌다. 권한이나 금액 같은 값을 ViewState에 담고 판단의 근거로 삼으면 안 된다. **서버에서 다시 검증해야 한다.**

## 페이지 생명주기

이벤트가 언제 도는지 알아야 코드를 어디에 둘지 정할 수 있다.

```
1. Page_PreInit
2. Page_Init
3. Page_Load          ← 데이터 로드
4. Control Events     ← 버튼 클릭 등
5. Page_PreRender
6. Render (메서드)     ← HTML 생성. 이벤트가 아니라 오버라이드하는 메서드다
7. Page_Unload
```

**`Page_Load`가 컨트롤 이벤트보다 먼저 돈다**는 게 중요하다. 버튼을 눌렀을 때도 `Page_Load` → `btnSubmit_Click` 순서다. 그래서 `Page_Load`에서 무조건 데이터를 다시 바인딩하면, 이벤트 핸들러가 보는 값이 사용자가 고른 값이 아닐 수 있다.

## 데이터 접근

```csharp
private string connString =
    ConfigurationManager.ConnectionStrings["MyDB"].ConnectionString;

private bool SaveApplication()
{
    using (SqlConnection conn = new SqlConnection(connString))
    {
        string query = @"INSERT INTO applications
                         (item_id, applicant_name, reason, application_date)
                         VALUES (@ItemId, @ApplicantName, @Reason, @ApplicationDate)";

        SqlCommand cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@ItemId", ViewState["SelectedItemId"]);
        cmd.Parameters.AddWithValue("@ApplicantName", txtApplicantName.Text.Trim());
        // ...
        conn.Open();
        return cmd.ExecuteNonQuery() > 0;
    }
}
```

`AddWithValue`로 **파라미터 바인딩**을 쓴다. 레거시 화면에서 문자열을 이어 붙여 쿼리를 만드는 코드를 보면 SQL Injection 지점이므로 바꾼다.

`using` 블록은 Java의 try-with-resources와 같다. 블록을 벗어나면 커넥션이 닫힌다.

`Web.config`에 접속 문자열과 인증 방식이 있다.

```xml
<configuration>
  <connectionStrings>
    <add name="MyDB"
         connectionString="Data Source=...;Initial Catalog=...;Integrated Security=True"
         providerName="System.Data.SqlClient" />
  </connectionStrings>
  <system.web>
    <authentication mode="Forms" />
  </system.web>
</configuration>
```

## Spring에서 오면 헷갈리는 것

| | Spring MVC | Web Forms |
|---|---|---|
| 요청 단위 | URL → 컨트롤러 메서드 | **페이지 전체가 서버로 왕복** |
| 상태 유지 | 세션 또는 무상태 | **ViewState가 클라이언트를 왕복** |
| 화면과 로직 | 템플릿과 컨트롤러가 분리 | `.aspx`와 `.aspx.cs`가 **한 쌍으로 묶임** |
| 이벤트 | HTTP 메서드 매핑 | 버튼 클릭 같은 **UI 이벤트가 서버 메서드** |

Web Forms는 "웹을 데스크톱 폼처럼" 다루려 한 설계다. 그래서 서버 메서드가 UI 이벤트 이름을 갖는다. 이 전제를 알고 보면 코드가 훨씬 빨리 읽힌다.

## 아직 정리 못 한 것

- `UpdatePanel`(부분 PostBack)의 동작과 한계
- Master Page와 사용자 정의 컨트롤
- `Session`과 ViewState를 갈라 쓰는 기준
