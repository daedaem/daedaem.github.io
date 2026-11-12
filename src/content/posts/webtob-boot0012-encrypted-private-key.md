---
title: 'WebtoB가 기동 중에 멈췄다: PFX를 PEM으로 바꾸다 걸린 개인키 암호(BOOT0012)'
description: '정식 인증서로 바꾸자 WebtoB가 BOOT0012를 남기고 올라오지 않았다. 자체 서명 인증서로 됐던 설정과 하나씩 비교해 개인키 암호가 원인임을 찾고, 암호 없는 키와 파일 권한으로 정리한 과정이다.'
date: 2026-10-26
updated: 2026-11-13
happened: '2026년 10월'
cause: 'PFX에서 개인키를 꺼낼 때 암호를 걸었는데, 서비스로 뜨는 WebtoB는 그 암호를 입력받을 방법이 없었다. HTH가 입력을 기다리다 시간 초과로 내려갔다.'
category: 'auth-security'
tags: ['WebtoB', 'HTTPS', 'TLS', 'OpenSSL', 'PFX', 'PEM', 'Windows Server']
draft: false
---

> 도메인·IP·포트·경로·계정은 모두 예시 값이다. `example.com`과 `192.0.2.x`는 문서 예시용으로 예약된 값이다. 1편은 [WebtoB(Windows)에 HTTPS 붙이기](/posts/webtob-https-self-signed-first/)다.

먼저 세 줄로 요약하면 이렇다. 정식 인증서로 바꾸자 WebtoB가 `BOOT0012`를 남기고 기동에 실패했다. 자체 서명 인증서로 잘 뜨던 때와 비교해 보니 달라진 건 개인키에 암호가 걸려 있다는 것 하나였다. 같은 키를 암호 없이 다시 저장하고 파일 권한으로 보호해서 해결했다.

1편에서 자체 서명 인증서로 HTTPS가 뜨는 것까지 확인해 뒀기 때문에, 정식 인증서는 파일만 바꾸면 끝날 줄 알았다. 그렇게 되지 않았다.

## PFX를 왜 그대로 설치하지 않았나

정식 인증서는 PFX 파일로 받았다. Windows라서 더블클릭해서 인증서 저장소에 가져오면 될 것 같지만, WebtoB는 Windows 인증서 저장소를 읽지 않는다. `http.m`에 적어 준 PEM 파일 경로를 읽는다. 저장소에 설치해 봐야 WebtoB에는 아무 효과가 없고 개인키 사본만 하나 더 생긴다. 그래서 PFX를 PEM으로 나눠서 적용했다.

## PFX 안을 먼저 봤다

관리 PC의 PowerShell에서 했다.

```powershell
& $OpenSSL pkcs12 -in "C:\work\cert\server.pfx" -info -noout -legacy
```

| 출력 | 의미 |
| --- | --- |
| `Certificate bag` | 인증서 1개 (개수만큼 반복) |
| `Shrouded Keybag` | 암호화된 개인키가 들어 있음 |
| `pbeWithSHA1And40BitRC2-CBC` | 구형 암호화 방식이라 `-legacy`가 필요 |

여기서 두 번 틀렸다. 처음에는 `-legacy` 없이 실행해서 `unsupported ... RC2-40-CBC` 오류를 봤다. OpenSSL 3.x는 구형 방식으로 묶인 PFX를 기본으로는 열어 주지 않는다. 그다음에는 `-noout`을 붙인 채로 실행해 놓고 파일이 안 생겨서 이유를 찾았다. `-noout`은 정보만 보여 주고 파일은 만들지 않는다.

## 인증서, 개인키, 체인으로 나누기

```powershell
# 서버 인증서
& $OpenSSL pkcs12 -in "C:\work\cert\server.pfx" -clcerts -nokeys `
  -out "C:\work\cert\server.crt" -legacy

# 개인키 (PFX 암호를 넣고, 새 개인키 보호 암호를 2번 입력)
& $OpenSSL pkcs12 -in "C:\work\cert\server.pfx" -nocerts `
  -out "C:\work\cert\server.key" -legacy

# CA 인증서
& $OpenSSL pkcs12 -in "C:\work\cert\server.pfx" -cacerts -nokeys `
  -out "C:\work\cert\chain.pem" -legacy
```

OpenSSL은 성공해도 성공했다는 말을 하지 않는다. 오류 없이 프롬프트로 돌아오면 파일과 내용으로 직접 확인해야 한다. 그리고 두 번째 명령에서 새 암호를 물어보는 대로 암호를 걸었다. 이게 뒤에서 문제가 된다.

나눈 뒤에는 인증서와 개인키가 짝이 맞는지 확인했다. 두 해시가 같아야 한다.

```powershell
& $OpenSSL x509 -in "C:\work\cert\server.crt" -pubkey -noout |
  & $OpenSSL pkey -pubin -outform PEM | & $OpenSSL dgst -sha256
& $OpenSSL pkey -in "C:\work\cert\server.key" -pubout -outform PEM |
  & $OpenSSL dgst -sha256
```

PowerShell 5.1은 명령 사이의 파이프를 바이트가 아니라 문자열로 넘긴다. DER 같은 바이너리를 파이프로 넘기면 깨질 수 있어서 PEM(텍스트)으로 비교했다.

체인 파일에는 중간 CA만 넣는다. Subject와 Issuer가 다르면 중간 CA이고, 같으면 루트 CA다. 루트 CA는 서버가 아니라 사용자 PC의 신뢰 저장소에 있어야 의미가 있다. 폐쇄망에서는 PC가 빠진 중간 CA를 인터넷에서 받아 올 수 없으니 체인 설정이 특히 중요하다.

## 정식 인증서로 바꾸자 기동이 멈췄다

설정을 백업하고, 세 파일을 서버의 `C:\WebtoB\ssl`에 옮긴 뒤 `*SSL` 절의 경로만 바꿨다.

```txt
*SSL
ssl_app
    CertificateFile      = "C:/WebtoB/ssl/server.crt",
    CertificateKeyFile   = "C:/WebtoB/ssl/server.key",
    CertificateChainFile = "C:/WebtoB/ssl/chain.pem",
    Protocols            = "-TLSv1, -TLSv1.1, TLSv1.2"
```

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

나중에 보니 컴파일할 때 이미 힌트가 나와 있었다. 실패가 아니라 안내 메시지였다.

```txt
CFL0367: Configuration uses SSL/TLS. When booting WebtoB, the user may need to type in
password if certificates and/or private keys are encrypted. PassPhraseDialog may be used
to avoid manually typing password.
```

## 하나만 다른 걸 찾았다

자체 서명 인증서로는 잘 떴으니, 그때와 지금이 뭐가 다른지 표로 적어 봤다.

| 비교 | 결과 |
| --- | --- |
| 자체 서명 인증서 + 암호 없는 개인키 | 정상 기동 |
| 정식 인증서 + 암호 있는 개인키 | `BOOT0012` |
| 인증서와 개인키의 짝 | 일치 |
| 개인키를 읽을 때 암호를 묻는가 | 묻는다 |

```powershell
# 암호를 물으면 암호화된 키다
& $OpenSSL pkey -in "C:\work\cert\server.key" -noout
```

달라진 건 개인키 암호 하나였다. PFX에서 키를 꺼낼 때 내가 건 암호다. 서비스로 뜨는 WebtoB는 암호를 입력받을 방법이 없으니, HTH가 입력을 기다리다 시간 초과로 내려간 것으로 판단했다. `CFL0367`이 미리 알려 준 내용 그대로였다.

## 같은 키를 암호 없이 다시 저장했다

```powershell
& $OpenSSL pkey -in "C:\work\cert\server.key" -out "C:\work\cert\server-nopass.key"

# 암호를 묻지 않고 읽혀야 한다
& $OpenSSL pkey -in "C:\work\cert\server-nopass.key" -check -noout
```

새 키를 만드는 게 아니라 같은 키를 암호 없이 다시 저장하는 것이다. 인증서와의 짝은 그대로다. 원본 `server.key`는 덮어쓰지 않고 남겨 뒀다. 서버에 옮긴 뒤 `CertificateKeyFile` 경로만 바꿨다.

```txt
CertificateKeyFile = "C:/WebtoB/ssl/server-nopass.key",
```

컴파일하고 재기동하니 정상으로 올라왔다.

`PassPhraseDialog`로 암호를 자동 입력하게 하는 방법도 있다고 한다. 하지만, 내가 쓰는 WebtoB 버전과 Windows 서비스 환경에서 정확히 어떻게 설정하는지 확인하지 못했고, 암호를 설정 파일에 평문으로 적는 것도 내키지 않았다. 그래서 서비스 자동 기동 환경에서 흔히 쓰는 '암호 없는 개인키 + 파일 권한으로 보호' 쪽을 골랐다. 다음부터는 개인키를 꺼낼 때 `-nodes`(OpenSSL 3.x에서는 `-noenc`)를 붙여서 처음부터 암호 없는 키로 뽑으면 이 단계를 건너뛸 수 있다.

개인키 파일의 암호를 없애도 HTTPS 통신의 암호화 수준은 그대로다. 파일 암호는 디스크에 저장된 키를 지키는 것이고 통신 암호화와는 별개다. 대신 그 파일을 읽을 수 있는 사람이 곧 키를 가질 수 있게 된다. 파일 권한이 유일한 보호 수단이 되는 셈이라, 이 방식이 조직의 보안 정책상 허용되는지는 따로 확인해야 한다.

## 그래서 파일 권한을 정리했다

기본 상속 상태에서는 `BUILTIN\Users`에 읽기 권한이 붙어 있을 수 있다. 암호 없는 개인키라면 반드시 정리해야 한다.

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

`S-1-5-32-544`는 Administrators, `S-1-5-18`은 SYSTEM이다. 이름 대신 이 값을 쓰면 OS 언어와 관계없이 동작한다. 권한을 바꾼 뒤에는 WebtoB를 다시 띄워서 키를 읽을 수 있는지 꼭 확인한다. 안 읽힌다고 `Everyone`에 권한을 주면 안 된다.

파일 정리도 작업에 들어간다. 관리 PC에 남은 PFX와 개인키 사본은 적용과 검증이 끝난 뒤 정리하고, 개인키, PFX, 비밀번호는 메일이나 메신저로 보내지 않는다.

## 이중화 서버에서 조심할 것

서버가 2대라서 인증서를 어떻게 둘지도 정해야 했다. 같은 인증서와 개인키를 2대에 같이 쓰면 발급과 갱신을 한 번만 하면 되지만 개인키 사본이 2개가 된다. 서버별로 따로 발급받으면 개인키가 서버 밖으로 나가지 않는 대신 발급과 갱신을 두 번 해야 한다. 인증서는 서버 대수가 아니라 접속 도메인(SAN) 기준이라 같이 쓰는 것 자체는 가능하다. 같이 쓴다면 정책상 괜찮은지 확인하고, 인증서와 개인키는 항상 짝으로 옮겨야 한다.

가장 하기 쉬운 실수는 한 서버만 교체하거나 갱신하는 것이다. L4가 요청을 나눠 보내기 때문에 일부 사용자만 경고를 보게 되고, 그러면 원인을 찾기가 정말 어렵다. 적용하거나 갱신한 뒤에는 서버마다 직접 접속해 보고, 두 서버의 파일 해시가 같은지도 확인한다.

```powershell
# 서버 1, 서버 2에서 각각 실행. 두 서버의 값이 같아야 한다
Get-FileHash "C:\WebtoB\ssl\server.crt","C:\WebtoB\ssl\server-nopass.key" -Algorithm SHA256
```

## 남기는 것

이번에 배운 건 기술보다 순서였다. 한 번에 하나만 바꿔서 비교하니 원인이 바로 나왔다. 인증서, 체인, 포트는 그대로 두고 개인키만 바꿔 본 덕분이다. 반대로 자체 서명 단계를 건너뛰고 정식 인증서부터 넣었다면, 설정이 틀린 건지 인증서가 틀린 건지 키가 틀린 건지 구분하지 못했을 것이다.

그리고 운영 서버라면 원인 분석보다 백업해 둔 설정으로 되돌려 서비스를 살리는 게 먼저다. `CFL0367` 같은 안내 메시지도 실패가 아니라고 지나치지 말고 읽어야 한다는 것도 알았다.
