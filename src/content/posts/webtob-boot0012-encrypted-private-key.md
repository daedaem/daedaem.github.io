---
title: 'WebtoB가 기동 중에 멈췄다: 자체 서명으로 먼저 확인해 둔 덕분에 찾은 개인키 암호(BOOT0012)'
description: '내부망 시스템에 사설 인증서로 HTTPS를 적용했다. 자체 서명 인증서로 설정을 먼저 확인해 둔 덕분에, 정식 인증서에서 WebtoB가 BOOT0012로 멈췄을 때 원인을 개인키 암호 하나로 좁힐 수 있었다.'
date: 2026-10-26
updated: 2026-11-13
happened: '2026년 10월'
cause: 'PFX에서 개인키를 꺼낼 때 암호를 걸었는데, 서비스로 뜨는 WebtoB는 그 암호를 입력받을 방법이 없었다. HTH가 입력을 기다리다 시간 초과로 내려갔다.'
category: 'auth-security'
tags: ['WebtoB', 'HTTPS', 'TLS', 'OpenSSL', 'PFX', 'Windows Server']
draft: false
---

> 경로와 파일 이름은 예시 값이다. 명령어와 설정 절차는 위키의 [HTTPS 적용 절차](/wiki/webtob-https-on-windows/)와 [PFX를 PEM으로 나누기와 개인키 파일 권한](/wiki/pfx-to-pem-and-private-key-permission/)에 따로 정리했다.

내부망 웹 시스템에 HTTPS를 적용하는 작업을 했다. 내부망에서만 쓰는 시스템이라 공인 인증서 대신 사설 인증서를 쓰기로 했다. 구성은 Windows Server에 WebtoB와 WAS가 있고, 서버 2대 이중화에 앞단에 L4가 있다.

## 자체 서명 인증서로 먼저 해 봤다

정식 인증서가 나오기 전에 자체 서명 인증서를 만들어서 먼저 붙여 봤다. HTTPS가 안 될 때는 설정이 틀린 건지, 포트가 막힌 건지, 인증서가 틀린 건지 구분하기가 어렵다. 그래서 인증서가 아닌 부분을 먼저 확인해 두고 싶었다.

자체 서명 인증서로 WebtoB에 HTTPS 가상호스트를 추가하고, 서버마다 직접 접속해 보고, 테스트 PC 한 대에만 임시로 신뢰 등록을 해서 경고 없이 접속되는 것까지 봤다. 기존 HTTP는 그대로 뒀다. 여기까지 되고 나니 정식 인증서는 파일만 바꾸면 끝날 줄 알았다.

## 정식 인증서로 바꾸자 기동이 멈췄다

정식 인증서는 PFX 파일로 받았다. WebtoB는 Windows 인증서 저장소를 읽지 않고 설정 파일에 적어 준 PEM 파일 경로를 읽는다. 그래서 PFX를 인증서, 개인키, 체인으로 나눠서 서버에 옮기고 설정의 경로만 바꿨다.

컴파일하고 재기동했는데 올라오지 않았다.

```txt
Starting WSM
Starting HTL
Starting HTH
BOOT0012: Process (C:/WebtoB/bin/hth.exe) has not answered in time.
Starting DOWN(...)
WSM had been killed due to the external factor.
DOWN0011: WebtoB is not running.
```

`BOOT0012`만 봐서는 뭐가 문제인지 알 수 없었다. HTH가 제한 시간 안에 응답하지 않아서 내려갔다는 결과만 말해 준다. 에러 로그에도 SSL 관련 상세 오류는 없었다.

## 하나만 다른 걸 찾았다

자체 서명 인증서로는 잘 떴으니, 그때와 지금이 뭐가 다른지 적어 봤다.

| 비교 | 결과 |
| --- | --- |
| 자체 서명 인증서 + 암호 없는 개인키 | 정상 기동 |
| 정식 인증서 + 암호 있는 개인키 | `BOOT0012` |
| 인증서와 개인키의 짝 | 일치 |
| 개인키를 읽을 때 암호를 묻는가 | 묻는다 |

설정, 포트, 접속 경로는 이미 확인한 것이라 볼 필요가 없었다. 남은 건 인증서 파일뿐이었고, 그중 달라진 건 개인키 암호 하나였다. PFX에서 키를 꺼낼 때 새 암호를 물어보는 대로 걸어 둔 것이다.

```powershell
# 암호를 물으면 암호화된 키다
& $OpenSSL pkey -in "C:\work\cert\server.key" -noout
```

서비스로 뜨는 WebtoB는 암호를 입력받을 방법이 없다. HTH가 입력을 기다리다 시간 초과로 내려간 것으로 판단했다. 나중에 보니 컴파일할 때 이미 힌트가 나와 있었다. 실패가 아니라 안내 메시지였다.

```txt
CFL0367: Configuration uses SSL/TLS. When booting WebtoB, the user may need to type in
password if certificates and/or private keys are encrypted.
```

## 같은 키를 암호 없이 다시 저장했다

```powershell
& $OpenSSL pkey -in "C:\work\cert\server.key" -out "C:\work\cert\server-nopass.key"
```

새 키를 만드는 게 아니라 같은 키를 암호 없이 다시 저장하는 것이라 인증서와의 짝은 그대로다. 서버에 옮기고 설정에서 개인키 경로만 바꾼 뒤 재기동하니 정상으로 올라왔다.

`PassPhraseDialog`로 암호를 자동 입력하게 하는 방법도 있다고 한다. 하지만, 내가 쓰는 WebtoB 버전과 Windows 서비스 환경에서 정확히 어떻게 설정하는지 확인하지 못했고, 암호를 설정 파일에 평문으로 적는 것도 내키지 않았다. 그래서 서비스 자동 기동 환경에서 흔히 쓰는 '암호 없는 개인키 + 파일 권한으로 보호' 쪽을 골랐다.

개인키 파일의 암호를 없애도 HTTPS 통신의 암호화 수준은 그대로다. 대신 그 파일을 읽을 수 있는 사람이 곧 키를 가질 수 있게 되니, 파일 권한이 유일한 보호 수단이 된다. 그래서 인증서 폴더는 권한 상속을 끊고 관리자, SYSTEM, WebtoB 실행 계정만 읽을 수 있게 해 둬야 한다. 이 방식이 조직의 보안 정책상 허용되는지는 따로 확인해야 한다.

## 남기는 것

이번에 배운 건 기술보다 순서였다. 한 번에 하나만 바꿔서 비교하니 원인이 바로 나왔다. 자체 서명 단계를 건너뛰고 정식 인증서부터 넣었다면, 설정이 틀린 건지 인증서가 틀린 건지 키가 틀린 건지 구분하지 못했을 것이다.

운영 서버라면 원인 분석보다 백업해 둔 설정으로 되돌려 서비스를 살리는 게 먼저다. 그리고 `CFL0367` 같은 안내 메시지도 실패가 아니라고 지나치지 말고 읽어야 한다는 것도 알았다.
