---
draft: false
title: 'PFX를 PEM으로 나누기와 개인키 파일 권한'
description: 'PFX로 받은 인증서를 WebtoB가 읽는 PEM 파일로 나누고, 인증서와 개인키의 짝을 확인하고, 암호 없는 개인키를 파일 권한으로 보호하는 방법.'
topic: 'infra'
tags: ['OpenSSL', 'PFX', 'PEM', 'WebtoB', 'Windows Server']
created: 2026-10-26
updated: 2026-11-13
status: 'stable'
---

**한 줄 요약.** WebtoB는 Windows 인증서 저장소가 아니라 **PEM 파일 경로**를 읽는다. PFX는 인증서, 개인키, 체인으로 나눠서 적용하고, 서비스로 기동하는 서버에서는 **개인키에 암호를 걸지 않는 대신 파일 권한으로 보호**한다. 암호 걸린 개인키 때문에 기동이 멈춘 사례는 [WebtoB가 기동 중에 멈췄다](/posts/webtob-boot0012-encrypted-private-key/)에 있다.

> 경로와 계정은 예시 값이다. 전체 적용 순서는 [WebtoB(Windows)에 사설 인증서로 HTTPS 적용하는 절차](/wiki/webtob-https-on-windows/)를 본다.

## 왜 Windows 저장소에 설치하지 않나

| 구분 | Windows 저장소에 설치 | WebtoB에 적용 |
| --- | --- | --- |
| 방법 | PFX 더블클릭 후 가져오기 | `http.m`에 PEM 파일 경로 지정 |
| 사용하는 프로그램 | IIS 등 | WebtoB |
| WebtoB에 효과 | 없음 | 있음 |

저장소에 설치하면 개인키 사본만 늘어난다.

## PFX 내부 확인

```powershell
& $OpenSSL pkcs12 -in "C:\work\cert\server.pfx" -info -noout -legacy
```

| 출력 | 의미 |
| --- | --- |
| `Certificate bag` | 인증서 1개 (개수만큼 반복) |
| `Shrouded Keybag` | 암호화된 개인키가 들어 있음 |
| `pbeWithSHA1And40BitRC2-CBC` | 구형 암호화 방식이라 `-legacy`가 필요 |

`-noout`은 정보만 출력하고 파일을 만들지 않는다. `-in`에는 PFX의 전체 경로를 적는다.

## 인증서, 개인키, 체인으로 나누기

```powershell
# 서버 인증서
& $OpenSSL pkcs12 -in "C:\work\cert\server.pfx" -clcerts -nokeys `
  -out "C:\work\cert\server.crt" -legacy

# 개인키. 서비스로 기동하는 서버에 쓸 키라면 -noenc(구버전은 -nodes)로 암호 없이 뽑는다
& $OpenSSL pkcs12 -in "C:\work\cert\server.pfx" -nocerts -noenc `
  -out "C:\work\cert\server.key" -legacy

# CA 인증서
& $OpenSSL pkcs12 -in "C:\work\cert\server.pfx" -cacerts -nokeys `
  -out "C:\work\cert\chain.pem" -legacy
```

OpenSSL은 성공해도 성공 메시지를 출력하지 않는다. 오류 없이 프롬프트로 돌아오면 파일과 내용으로 확인한다.

이미 암호를 걸어 뽑은 개인키는 같은 키를 암호 없이 다시 저장할 수 있다. 새 키를 만드는 것이 아니므로 인증서와의 짝은 그대로다.

```powershell
& $OpenSSL pkey -in "C:\work\cert\server.key" -out "C:\work\cert\server-nopass.key"

# 암호를 묻지 않고 읽혀야 한다
& $OpenSSL pkey -in "C:\work\cert\server-nopass.key" -check -noout
```

## 검증

```powershell
# 파일 크기가 0보다 커야 한다
Get-ChildItem "C:\work\cert" | Select-Object Name, Length

# SAN과 만료일
& $OpenSSL x509 -in "C:\work\cert\server.crt" -noout -subject -issuer -dates -ext subjectAltName

# 인증서와 개인키의 짝. 두 해시가 같아야 한다
& $OpenSSL x509 -in "C:\work\cert\server.crt" -pubkey -noout |
  & $OpenSSL pkey -pubin -outform PEM | & $OpenSSL dgst -sha256
& $OpenSSL pkey -in "C:\work\cert\server.key" -pubout -outform PEM |
  & $OpenSSL dgst -sha256

# 체인에 들어 있는 인증서 목록
& $OpenSSL crl2pkcs7 -nocrl -certfile "C:\work\cert\chain.pem" |
  & $OpenSSL pkcs7 -print_certs -noout
```

PowerShell 5.1은 명령 사이의 파이프를 바이트가 아니라 문자열로 넘긴다. DER 같은 바이너리를 파이프로 넘기면 깨질 수 있어 PEM(텍스트)으로 비교한다.

## 중간 CA와 루트 CA

| 구분 | Subject / Issuer | Basic Constraints |
| --- | --- | --- |
| 중간 CA | 서로 다름 (상위 CA가 발급) | CA:TRUE |
| 루트 CA | 같음 (자기 서명) | CA:TRUE |

`CertificateChainFile`에는 중간 CA를 넣는다. 루트 CA는 서버가 아니라 사용자 PC의 신뢰 저장소에 있어야 의미가 있다. 폐쇄망에서는 PC가 빠진 중간 CA를 인터넷에서 받아 올 수 없으므로 체인 설정이 특히 중요하다.

```txt
*SSL
ssl_app
    CertificateFile      = "C:/WebtoB/ssl/server.crt",
    CertificateKeyFile   = "C:/WebtoB/ssl/server-nopass.key",
    CertificateChainFile = "C:/WebtoB/ssl/chain.pem",
    Protocols            = "-TLSv1, -TLSv1.1, TLSv1.2"
```

## 암호 없는 개인키는 파일 권한으로 보호한다

개인키 파일의 암호를 없애도 HTTPS 통신의 암호화 수준은 그대로다. 파일 암호는 디스크에 저장된 키를 지키는 것이고 통신 암호화와는 별개다. 대신 파일을 읽을 수 있는 사람이 곧 키를 가질 수 있으므로 파일 권한이 유일한 보호 수단이 된다. 이 방식이 조직의 보안 정책상 허용되는지 먼저 확인한다.

기본 상속 상태에서는 `BUILTIN\Users`에 읽기 권한이 붙어 있을 수 있다.

```powershell
# 현재 권한 확인
icacls "C:\WebtoB\ssl\server-nopass.key"

# 상속 제거 후 관리자·SYSTEM만 전체 권한
icacls "C:\WebtoB\ssl" /inheritance:r /grant:r "*S-1-5-32-544:(OI)(CI)F" "*S-1-5-18:(OI)(CI)F"

# WebtoB 실행 계정에 읽기 권한 (실행 계정이 SYSTEM이면 생략)
icacls "C:\WebtoB\ssl" /grant "EXAMPLE\svc_webtob:(OI)(CI)R"

# 다시 확인. Users나 Everyone이 없어야 한다
icacls "C:\WebtoB\ssl\server-nopass.key"
```

- `S-1-5-32-544`는 Administrators, `S-1-5-18`은 SYSTEM이다. OS 언어와 관계없이 동작한다.
- 권한을 바꾼 뒤에는 WebtoB를 재기동해 키를 읽을 수 있는지 확인한다.
- 안 읽힌다고 `Everyone`에 권한을 주지 않는다.
- 관리 PC에 남은 PFX와 개인키 사본은 적용과 검증이 끝난 뒤 정리한다. 개인키, PFX, 비밀번호는 메일이나 메신저로 보내지 않는다.

## 이중화 서버

| 방식 | 장점 | 주의 |
| --- | --- | --- |
| 같은 인증서·개인키를 2대에 사용 | 발급·갱신 1회 | 개인키 사본 2개. 정책 허용 여부 확인 |
| 서버별로 개인키·CSR을 따로 발급 | 개인키가 서버 밖으로 나가지 않음 | 발급·갱신 2회 |

가장 하기 쉬운 실수는 한 서버만 교체하거나 갱신하는 것이다. L4가 요청을 나눠 보내므로 일부 사용자만 경고를 보게 되어 원인을 찾기 어렵다. 적용하거나 갱신한 뒤에는 서버마다 직접 접속해 보고 파일 해시를 비교한다.

```powershell
# 서버 1, 서버 2에서 각각 실행. 두 서버의 값이 같아야 한다
Get-FileHash "C:\WebtoB\ssl\server.crt","C:\WebtoB\ssl\server-nopass.key" -Algorithm SHA256
```

## 자주 나오는 오류

| 증상 | 원인 | 해결 |
| --- | --- | --- |
| `Can't open "..." for reading` | 현재 폴더와 파일 위치가 다름 | `-in`에 전체 경로 |
| `unsupported ... RC2-40-CBC` | 구형 방식 PFX. OpenSSL 3.x 기본 미지원 | `-legacy` |
| 추출 파일이 안 생김 | `-noout`은 확인 전용 | 추출 명령을 따로 실행 |
| `CFL0367` | 안내 메시지 (실패 아님) | 개인키가 암호화돼 있는지 확인 |
| `HTH0267 Cannot open certificate file` | 파일이 서버에 없거나 경로·권한 문제 | 서버 경로에 배치, 권한 확인 |
| `BOOT0012 hth.exe has not answered in time` | 암호화된 개인키의 암호 입력 대기 | 같은 키를 암호 없이 저장하고 권한 제한 |
