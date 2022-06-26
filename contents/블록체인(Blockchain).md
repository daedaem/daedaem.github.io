---
date: '2022-06-26'
title: '블록체인(Blockchain) 기본 개념 구현 및 해쉬의 이해'
categories: ['블록체인', '도메인 지식', 'TIL']
summary: '블록체인 기술은...'
thumbnail: './bitcoin.png'
---

# 1.블록체인의 역사

## 1-1. 초창기

- 블록체인 기술에 대한 아이디어는 1991년 초,과학자 스튜어트 하버(Stuart Haber)와 스캇 스토네타(W. Scott Stornetta)에 의해 제시됨. 이들은 실용적인 수학적 해결책을 타임 스탬핑에 도입해 디지털 문서의 날짜가 변경되거나 위조될 수 없게 했습니다. 이는 타임 스탬프를 저장하는데 암호학적으로 안전한 블록들의 체인을 사용했으며, 1992년 머클 트리 구조를 도입한 후 여러 문서를 하나의 블록에 모을 수 있게 되며 보다 효율적이게 됐습니다. 그러나 이 기술은 사용되지 않기 시작했으며, 비트코인이 탄생하기 4년 전인 2004년에는 특허권이 만료되었습니다.

<figure style="display:flex;">
<img src="https://cazoo.it/wp-content/uploads/2021/05/Stuart-Haber-e-Scott-Stornetta.jpg"  style="max-width:400px;" alt="https://cazoo.it/wp-content/uploads/2021/05/Stuart-Haber-e-Scott-Stornetta.jpg" />
</figure>

## 1-2. **재사용 가능한 작업 증명 방식**

- 2004년 컴퓨터 공학자이자 암호학 활동가 할 핀니(Hal Finney)는 재사용 가능한 작업 증명 방식(RPoW:Reusable Proof of Work) 시스템을 제시했습니다.

  이 시스템은 교환이 불가능하거나 대체할 수 없는 해시캐시(Hashcash)를 작업 증명 방식 토큰에 기반해 수신한 뒤, RSA 서명(RSA-signed)이 된 재사용 가능한 토큰으로 반환했으며, RSA 서명이 된 토큰은 개인 간에 전송될 수 있었습니다.

  재사용 가능한 작업 증명 방식은 전 세계의 유저들이 정확도와 무결성을 실시간으로 확인할 수 있도록 설계된 신뢰할 수 있는 서버에 토큰의 소유권을 기록함으로써 이중 지불의 문제를 해결했습니다.

  재사용 가능한 작업 증명 방식은 암호 화폐 역사의 프로토타입이자 중요한 초기 단계였다고 할 수 있습니다.

## 1-3. 비트코인 네트워크

- 2008년 말, 사토시 나카모토라는 익명의 개인 혹은 그룹에 의해 비트코인이라 불리는 탈중앙화된 개인간 전자 지불 시스템에 관한 백서가 암호학 메일링 리스트에 전송되었습니다.

  비트코인은 해시캐시 작업 증명 방식 알고리즘에 기반을 두고 있으나, 재사용 가능한 작업 증명 방식과 같이 신뢰할 수 있는 컴퓨팅 기능의 하드웨어를 사용하지 않고, 트랜잭션을 추적하고 검증하는 탈중앙화된 개인간 네트워크 프로토콜을 통해 이중 지불 문제를 해결했습니다. 간단히 말해, **비트코인은 작업 증명 방식 매커니즘을 통해 개인 마이너들의 보상으로 마이닝되며, 이후 탈중앙화화된 네트워크 노드에 의해 검증됩니다.**

  2009년 1월 3일, 사토시 나카모토에 의해 최초 블록이 마이닝되며 첫 비트코인이 탄생했습니다. 당시 블록 보상은 50 비트코인이었습니다. 첫 비트코인의 수령자는 할 핀니였습니다. 2009년 12월, 그는 세계 최초 비트코인 트랜잭션을 통해 사토시 나카모토로부터 10 비트코인을 전송 받았습니다.

--

# 2. 블록체인 배경

## 2-1 .**기존 중앙집중형 시스템의 문제**

![https://cfnimage.commutil.kr/phpwas/restmb_allidxmake.php?idx=3&simg=20160425003812151975fnimage_01.jpg](https://cfnimage.commutil.kr/phpwas/restmb_allidxmake.php?idx=3&simg=20160425003812151975fnimage_01.jpg)

### (1) **비용 문제**

제3자인 중앙집중형 관리시스템은 거래자들 사이에서 과도한 관리, 중개수수료를 청구

데이터베이스를 유지, 관리하기 위해 많은 보안유지비용을 지출. 금융권의 경우, 매년 천문학적인 돈을 보안인프라에 투자하고 이 비용은 우리에게도 부담이 됌.

### (2) **시간 문제**

은행의 경우 각 은행들의 데이터베이스를 통해 거래를 확인하고 청산하기까지 중앙은행과 금융결제원, 외환거래의 경우 더 많은 중간다리가 포함됌.

해외물류의 경우도 마찬가지로 화주부터 트럭회사, 해운사, 심지어 보험사까지 많은 중간 이해관계자들 존재. 이러한 많은 미들맨(Middle man)들이 존재할 경우, 프로세스 전반에 걸쳐 시간과 비용이 증가하여 효율성이 떨어집니다.

### (3) **보안 문제**

중앙집중형 데이터베이스를 이용하게되면 해커들의 공격대상은 오직 하나, 중앙.

아무리 보안유지에 힘을 쓴다 하더라도 해커의 목표가 분산되어 있지 않고, 오직 중앙 하나만 공격한다면 중앙에 있는 우리의 모든 데이터 보안이 뚫리게 됌.

--

# 3. 블록체인(Blockchain)이란

<figure>
<iframe width="640" height="360"  src="https://www.youtube.com/watch?v=Ca7Meu4z-F4"  frameborder="0" allow="autoplay; encrypted-media" allowfullscreen ></iframe>
</figure>

![https://www.etri.re.kr/webzine/20190329/common/images/sub01_02.jpg](https://www.etri.re.kr/webzine/20190329/common/images/sub01_02.jpg)

블록+체인=블록체인

사전적 정의 : `‘누구나 열람할 수 있는 **디지털 장부**에 **거래 내역을 투명하게 기록**하고, **여러 대의 컴퓨터에 이를 복제해 저장**하는 **분산형 데이터 저장기술**’`

변조나 왜곡을 막기 위해 **‘블록(Block)’** **단위로 생성되는 기록을 여러 장소에 나눠(분산) 저장**한다. 따라서 블록체인에선 **해킹이 불가능하고, 정보가 온전하게 저장**될 수 있다.

> 관리 대상 데이터를 ‘블록’이라고 하는 소규모 **데이터**들이 **p2p** 방식을 기반으로 생성된 체인 형태의 연결고리 기반 분산 데이터 저장 환경에 저장하여 누구라도 임의로 수정할 수 없고 누구나 변경의 결과를 열람할 수 있는 분산 컴퓨팅 기술 기반의 원장 관리 기술이다.

## 3-1. **블록체인 구성요소**

<figure style="display:flex;">
<img src="https://steemitimages.com/1280x0/https://steemitimages.com/DQmT41naG75LWrizbQ9uyw8uKEo8Ggkzu6A6XdcmRHmWkG5/block_element.png" style="max-width:400px;" alt="https://steemitimages.com/1280x0/https://steemitimages.com/DQmT41naG75LWrizbQ9uyw8uKEo8Ggkzu6A6XdcmRHmWkG5/block_element.png" /> <img src="https://steemitimages.com/1280x0/https://steemitimages.com/DQmc3RRboMPS9CCjdT8CwACUCaYXYviBG3WbKycn9A2xq6k/block_chain.png"  style="max-width:400px;"alt="https://steemitimages.com/1280x0/https://steemitimages.com/DQmc3RRboMPS9CCjdT8CwACUCaYXYviBG3WbKycn9A2xq6k/block_chain.png" />
</figure>

### **해시함수**

- 해시함수는 임이의 길이를 갖는 메시지를 입력받아 고정된 길이의 해시값을 출력하는 함수이다.
- 해시 함수를 사용하는 목적은 메시지의 오류나 변조를 탐기 위해, 즉 데이터의 무결성을 제공하기 위해 사용한다.

  **해시함수의 특징**

  - 어떤 입력 값에도 항상 고정된 길이의 해시 값을 출력 한다.
  - 입력 값의 아주 일부만 변경되어도 전혀 다른 결과 값을 출력한다.(눈사태 효과)
  - 출력된 결과 값을 토대로 입력 값을 유추할 수 없다.
  - 같은 내용 입력값으로 주면 결과 값은 항상 같다.

<**암호 SHA-256 기반 암호 '해시(Hash)함수'>**

SHA256 해시함수를 이용한다면 **어떤 길이의 입력값이라도 256비트의 고정된 결과값을 출력**할 것이고

**입력값의 아주 일부만 변경되어도 전혀 다른 값이 출력**되는 특징 때문에 **데이터가 변경되었는지 쉽게 확인할 수 있습니다**

![https://s3.us-west-2.amazonaws.com/secure.notion-static.com/f394a697-78a4-4975-bcfa-d52d84f1b94c/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220626%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220626T065324Z&X-Amz-Expires=86400&X-Amz-Signature=8a6456858f8e08cf6e1b402ba5779768178edab15344cd65172abfff54fef58a&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Untitled.png%22&x-id=GetObject](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/f394a697-78a4-4975-bcfa-d52d84f1b94c/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220626%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220626T065324Z&X-Amz-Expires=86400&X-Amz-Signature=8a6456858f8e08cf6e1b402ba5779768178edab15344cd65172abfff54fef58a&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Untitled.png%22&x-id=GetObject)

[https://www.youtube.com/watch?v=67UwxR3ts2E](https://www.youtube.com/watch?v=67UwxR3ts2E)

### **블록해시**

<figure>
<img src="https://steemitimages.com/DQmWnWhqUYgppG6UGDLgYahbq15wm9eXa4mGKfSvLoDFtPP/block_hash_ver_01.png" style="max-width:400px;" alt="https://steemitimages.com/DQmWnWhqUYgppG6UGDLgYahbq15wm9eXa4mGKfSvLoDFtPP/block_hash_ver_01.png" /> 
</figure>

---

## 3-2. 🔨채굴

[https://www.youtube.com/watch?v=ElGBP90XZWE](https://www.youtube.com/watch?v=ElGBP90XZWE)

블록체인에 들어오는 거래내역 검증하고 질문의 답을 찾아 블록을 체인에 올리면서 이를 통해 받는 일종의 수수료가 코인

암호 화폐 마이닝(채굴)은 유저들 간 트랜잭션을 검증하고 이를 공개적인 블록체인 원장에 추가하며, 새로운 코인을 기존의 공급 물량에 추가하는 과정입니다.

### 작업증명(Proof-of-work, PoW)

이중 지불(디지털은 복제가 가능하므로)을 방지하는 메커니즘.

작업 증명은 새로운 블록을 블록체인에 추가하는 '작업'을 완료했음을 '증명'하는 것. 새로운 블록을 블록체인에 추가하려면, 그 새로운 블록의 블록 해쉬를 계산해내야하고, 그 블록 해쉬를 계산해내려면 그 블록의 블록 헤더 정보 중의 하나인 `nonce`값을 계산을 통해 구해야 한다.

<aside>
💡 결론적으로 이 nonce값을 구하는 것이 바로 `작업 증명`이다.

</aside>

### 지분증명(Proof-of-stake, PoS)

해당 코인을 보유하고 네트워크에 맡김으로써 증명.

지분증명이란 알고리즘의 한 형태로서, 이를 통해 암호화폐 블록체인 네트워크가 분산화된 합의를 얻는 것을 목표로 한다.
지분증명 기반의 암호화폐 시스템에서 다음 블록의 생성자는 블록체인의 관련 암호화폐를 특정량 보유하고 있는 ‘주주’들 중에서 선출된다

<figure>
<img src="https://blockgeeks.com/wp-content/uploads/2017/03/infographics2017-01.png" style="max-width:400px;" alt="https://blockgeeks.com/wp-content/uploads/2017/03/infographics2017-01.png" /> 
</figure>

---

### 📜**스마트 컨트랙**

개발자로서 코딩을 해서 주인이 없는 백엔드(공유 네트워크)에 올릴 수 있음.

전세계 사람들이 사용하는 네트워크에 내 코드를 공유, 검증하고 실행가능하지만 변경은 불가능

ex) 1. 1억원의 돈을 보관한다. 2. 1년뒤에 나에게 다시 인출한다.

에어비앤비(중개인) → 스마트컨트랙에 돈을 보내면 스마트 컨트랙은 TV를 켜고, 문을 열어주는.

스마트 컨트랙에 자율주행이 가능한 테슬라를 빌리는 렌트비를 지출하면 테슬라차는 지불자에게 이동.

---

## 3-3. **블록체인 특징**

블록체인의 장점과 단점

장점: 데이터를 분산 저장, 처리함으로써 위변조가 어려움, 중재자가 필요 없음.

단점: 거래정보 동기화가 오래 걸림, 거래내역이 전부에게 공개.

### 장점

<aside>
💡<p style="font-size:bold;"> 분산성</p>

</aside>

블록체인 데이터는 대개 수천 개의 분산화된 네트워크 노드에 저장되기 때문에, 시스템과 데이터는 기술적 실패와 악의적 공격에 대한 강한 저항력을 갖습니다. 각 네트워크 노드는 데이터베이스 사본을 복제하고 저장할 수 있으며, 이 때문에 한 노드가 오프라인으로 전환하더라도 네트워크 이용과 보안에 영향을 미치지 않습니다.

반면, 다수의 전통적인 데이터베이스는 단일 혹은 소수의 서버에 의존하며, 기술적 실패와 사이버 공격에 더욱 취약합니다.

<aside>
💡<p style="font-size:bold;"> 안정성</p>

</aside>

승인된 블록들은 되돌리기가 무척 어려우며, 이는 데이터가 블록체인에 기록된 다음에는 이를 삭제하거나 변경하기가 무척 어려움을 뜻합니다. 재무 기록을 저장하거나 감사 추적을 필요로 하는 데이터에 블록체인은 훌륭한 기술이며, 이는 모든 변경 기록을 추적할 수 있으며 분산화된 공개 원장에 영구적으로 기록되기 때문입니다.

예를 들어, 한 회사는 블록체인 기술을 직원의 부정 행위를 방지하는 데 사용할 수 있습니다. 이러한 상황에서 블록체인은 회사 내에서 발생하는 모든 재정 거래에 대한 보안 더불어 안정적인 기록을 제공할 수 있습니다. 이는 직원으로 하여금 의심스러운 거래들을 숨기기 더욱 어렵게 할 것입니다.

<aside>
💡<p style="font-size:bold;"> 신뢰가 필요없는 시스템</p>

</aside>

대부분의 전통적인 거래 시스템에서, 거래는 관련 두 당사자가 아닌 은행과 신용 카드 회사 또는 결제 제공자와 같은 중개자에 의존했습니다.

블록체인 기술을 사용하면 중개자가 더 이상 필요하지 않은데, 이는 분산화된 네트워크 노드가 [마이닝](https://academy.binance.com/ko/articles/what-is-cryptocurrency-mining)이라 알려진 과정을 통해 거래를 검증하기 때문입니다. 이러한 이유로 블록체인은 종종 신뢰가 필요없는 시스템(trustless system)으로 지칭됩니다.

그러므로 **블록체인 시스템은 단일 조직을 신뢰하는 데서 발생하는 리스크를 제거하고, 중개자와 제3자를 제외함으로써, 전체적인 비용과 거래 수수료를 절감할 수 있습니다..**

---

### **단점**

<aside>
💡<p style="font-size:bold;"> 51% 공격</p>

</aside>

블록체인 네트워크를 보호하는 [작업 증명 합의 알고리즘(Proof of Work)](https://academy.binance.com/ko/articles/what-is-a-blockchain-consensus-algorithm)은 수년에 걸쳐 매우 효율적이라는 것이 증명되었습니다. 그러나 블록체인 네트워크에 대해 수행할 수 있는 몇 가지 잠재적인 공격이 존재하며, [51%의 공격](https://academy.binance.com/ko/articles/what-is-a-51-percent-attack)이 가장 많이 논의되고 있습니다. 이러한 공격은 단일 주체가 네트워크 해싱 파워의 50% 이상을 통제할 수 있게 됐을 때 발생할 수 있으며, 고의적으로 트랜잭션 순서를 변경하거나 제외하여 종국에는 네트워크를 방해할 수 있습니다.

이론적으로 가능한 일임에도 불구하고, 51%의 공격이 비트코인 블록체인에 성공했던 적은 한 번도 없었습니다. 네트워크가 더 크게 성장함에 따라 보안이 증대되고, 정직하게 행동하는 것이 더 많은 보상을 얻을 수 있기에, 마이너가 비트코인을 공격하기 위해 많은 돈과 자원을 투자하지 않기 때문입니다. 이외에도, 성공적인 51% 공격은 단기간에 가장 최근의 트랜잭만을 수정할 수 있는데, 이는 블록들이 암호화된 증명을 통해 연결되어 있기 때문입니다(블록의 순서를 변경하는 것은 막대한 연산 능력을 필요로 합니다). 또한 비트코인 블록체인은 매우 탄력적이어서 공격에 빠르게 대처할 수 있습니다.

<aside>
💡<p style="font-size:bold;"> 데이터 수정</p>

</aside>

블록체인 시스템의 또 다른 단점은 블록체인에 데이터가 기록되면 이를 수정하기가 무척 어렵다는 것입니다. 안정성은 블록체인의 장점이긴 하지만, 이것이 언제나 좋은 것은 아닙니다. 블록체인 데이터나 코드를 변경하는 것은 매우 까다로우며, 한 체인이 버려지고 다른 체인이 이를 대신하는 하드 포크를 종종 필요로 합니다.

<aside>
💡<p style="font-size:bold;">프라이빗 키</p>

</aside>

블록체인은 공개키(혹은 비대칭키) 암호학을 사용해 사용자가 자신의 암호 화폐 자산(혹은 다른 블록체인 데이터)에 소유권을 주장할 수 있게 합니다. 각 블록체인 계정(혹은 주소)은 상응하는 두 개의 키를 갖고 있는데, 퍼블릭 키(공유될 수 있는)와 프라이빗 키(안전하게 보관되어야 하는)입니다. 사용자는 자신들의 자금에 접근하기 위해 프라이빗 키가 필요하며, 이는 스스로가 자신의 은행 역할을 한다는 것을 의미합니다. 사용자가 만약 프라이빗 키를 잃어버리게 된다면, 사실상 자금을 잃게되며, 이를 어찌할 수 있는 방법이 없습니다.

<aside>
💡<p style="font-size:bold;"> 비효율성</p>

</aside>

[작업 증명](https://academy.binance.com/ko/articles/proof-of-work-explained)을 사용하는 블록체인은 상당히 비효율적입니다. 마이닝 경쟁이 치열하고, 매 10분마다 단 한 명의 승자만 존재하기 때문에, 다른 모든 마이너들의 작업은 무용지물이 됩니다. 유효한 블록 해시를 찾을 수 있는 확률을 높이기 위해 마이너들은 지속적으로 자신의 연산 능력을 증가시켜 왔기에, 비트코인 네트워크에서 사용되는 자원은 지난 몇 년간 상당히 증가해 왔으며, 현재 덴마크나, 아일랜드, 나이지리아와 같은 국가들보다 더 많은 에너지를 소비하고 있습니다.

<aside>
💡<p style="font-size:bold;"> 저장공간</p>

</aside>

블록체인 원장은 시간이 지나며 무척 거대해질 수 있습니다. 비트코인 블록체인은 현재 200GB의 저장 공간을 필요로 합니다. 블록체인 규모의 성장 속도는 하드 드라이브의 성장 속도를 앞지를 것으로 보이며, 원장이 너무 커져 개인이 이를 다운로드하거나 저장할 수 없게 되면, 노드를 잃게 될 위험이 있습니다.

## 3-4. **블록체인의 종류**

- 공개 블록체인(Public blockchain, 개방형 블록체인): 접근 제한이 전혀 없는 블록체인.
- 비공개 블록체인(Private blockchains, 전용 블록체인): 특정 권한이 부여된 비공개 블록체인.
- 하이브리드 블록체인(Hybrid blockchain): 중앙식, 탈중앙식 기능을 모두 갖춘 블록체인.

--

# 4-1. 블록체인 활용

## 🚚공급망

1. 투명하고 변경할 수 없는 기록
2. 비용절감
3. 상호 운용 가능한 데이터 생성
4. 디지털 협정 및 문서공유
5. 전자식 자료 교환(EDI, Electronic Date Interchange)시스템 대체

ex) 커피시장에서 농부의 이력을 포함한 커피 원두의 생산단계부터 매장에 이르기까지의 유통단계를 블록체인에 기록하는 ‘빈투컵(bean to cup)’ 프로젝트

![https://www.kukinews.com/data/kuk/image/2021/04/19/kuk202104190382.680x.0.jpg](https://www.kukinews.com/data/kuk/image/2021/04/19/kuk202104190382.680x.0.jpg)

--

## 💊의료사업

1. **상호 운용**

블록체인 기반 의료 기록의 또다른 장점은 전문 병원, 종합 병원과 다른 의료 서비스 제공자 간의 상호 운용성을 향상시키는 것입니다. 데이터 저장 시스템의 기술적 차이로 인해, 각 기관들이 문서를 공유하기 힘들 때가 많습니다. 그러나 블록체인은 인가된 당사자가 환자 기록의 통합된 데이터베이스나 처방 기록들에 접근할 수 있게 함으로써 이러한 문제를 해결할 수 있습니다. 따라서 서로의 내부 저장소에 접속하지 않고서, 서비스 제공자들은 하나의 저장소에서 함께 작업할 수 있습니다.

2. **접근성과 투명성**

기록을 공유하는 과정을 단순화시키는 것 이외에도 블록체인 시스템은 환자들의 의료 정보가 보다 나은 접근성과 투명성을 갖게할 수 있습니다. 특정한 상황에서는, 환자 문서의 변경 사항 검증을 요청해 기록의 정확성을 보장할 수 있으며, 적절하게 사용된다면 이러한 종류의 검증은 인간적 실수와 의도적인 위변조에 대해 추가적인 보안을 제공할 수 있습니다.

3. **신뢰할 수 있는 공급망 관리**

블록체인은 제약 회사의 제조와 유통 과정 전반을 추적할 수 있는 신뢰할 수 있는 방법을 제공할 수 있으며, 이는 만연한 가짜 의약품 문제를 방지하는데 도움이 될 수 있습니다. 온도와 같은 요소를 측정하는 사물 인터넷 기기와 연계하여, 보관 상태와 배송 상황, 약품 품질을 인증하는 데 블록체인 기술을 활용할 수 있습니다.

--

## 📶사물인터넷(IoT)

1.**개인과 가정을 위한 사물 인터넷 활용**

사물 인터넷 기술은 아주 다양한 방식으로 개인과 가정에서 구현될 수 있습니다. 보편적인 예는 홈 오토메이션(home automation) 개념과 관련이 있는데, 여러 장치를 사용하여 조명, 에어컨, 히터, 보안 시스템 등을 모니터링하고 제어할 수 있습니다. 또한 이러한 장치는 스마트 시계나 스마트폰과 같은 개인 물품이나, 다른 스마트 홈 제품(스마트 TV와 냉장고와 같은)을 연결하도록 설계된 전용 스마트 허브에도 연결할 수 있습니다.

또한 홈 오토메이션은 노인과 시각, 청각 또는 이동에 제한이 있는 장애인들에게 보조 기술을 제공함으로써 삶의 질을 크게 향상시킬 수 있는 잠재력을 갖고 있습니다. 이는 친척 중 한 명의 심장 박동수가 비정상적이거나, 넘어지거나 할 경우 이를 알려주는 실시간 센서에 사용될 수도 있습니다. 또 다른 흥미로운 예시는, 침대가 사용중인지 확인하기 위해 스마트 침대를 사용하는 것인데, 이는 이미 일부 병원에서 환자들이 언제 침대를 빠져나가는지 확인하기 위해 테스트되고 있습니다.

2.**상업과 산업을 위한 사물 인터넷 활용**

산업용 사례 중 하나로는 온도, 습도, 기압과 품질과 같은 환경 조건을 추적하기 위한 센서 사용이 있습니다. 사물 인터넷 장치는 농부들이 가축을 위한 물이나 식량이 부족할 때나, 제조업자들이 중요한 제품이 고갈될 때를 파악하는데 사용될 수 있습니다. 또한 공급량이 특정 기준치보다 낮을 때 해당 제품을 더 많이 주문하도록 자동화된 시스템을 설정할 수도 있습니다.

--

## 💲금융

탈중앙화 금융(DeFi)이란? 블록체인 네트워크 위에서 작동하는 금융 애플리케이션 생태계를 일컫습니다.

1. **대출 & 대여**

개방형 대출 프로토콜은 DeFi 생태계 중에서 가장 인기 있는 유형의 애플리케이션입니다. 개방적이고 탈중앙화된 대출 및 대여 시스템은 전통적인 신용 시스템에 비해 많은 이점을 갖고 있습니다. 이는 즉각적인 거래 체결을 가능하게 하며, 디지털 자산을 담보물로 삼을 수 있고, 신용 확인이 불필요하며, 미래의 잠재적 표준화가 포함됩니다.

이러한 대출 서비스는 공용 블록체인 위에 구축되기 때문에, 최소한의 신뢰만 있어도 되며, 암호화된 검증 방법으로 보장됩니다. 블록체인상의 대출 시장은 거래 당사자의 위험을 줄여주고, 더 저렴하고, 빠르게, 많은 사람이 대출 및 대여 서비스를 이용할 수 있게 합니다.

2. **통화 은행 서비스**

DeFi 애플리케이션은 정의상 금융 애플리케이션이며, 통화 은행 서비스는 분명한 활용 예시 중 하나입니다. 여기에는 [스테이블 코인](https://academy.binance.com/en/glossary/stablecoin) 발행, 담보 대출, 보험 등이 포함될 수 있습니다.

블록체인 산업이 성숙해짐에 따라, 스테이블 코인 생성에 이목이 집중되고 있습니다. 이는 보통 실물 자산과 연동된 암호자산이지만, 상대적으로 쉽게 디지털로 전송될 수 있는 것입니다. 암호화폐 가격이 때로 빠르게 변동하기 때문에, 탈중앙화된 스테이블 코인은 중앙 당국이 발행하고 모니터링하지 않는 일상의 디지털 현금으로 채택될 수 있습니다.

담보 대출을 받는 과정은 많은 경우 참여해야 하는 중개인의 수 때문에 비싸며 시간도 많이 걸립니다. 스마트 콘트랙트를 사용하면, 담보 및 법률 수수료가 크게 감소할 수 있습니다.

블록체인상의 보험은 중개자를 없애고 많은 참여자에게 위험을 분산시킬 수 있습니다. 이는 동일한 서비스 품질을 유지하며, 보험료를 낮출 수 있습니다.

--

## NFT(Nonfungible Token)

NFT란 JPG, GIF, 비디오 등의 디지털 파일에 대한 소유권(일명 '토큰')을 블록체인상에 저장함으로써 위⸱변조가 불가능한 상태로 영구 보존하고, 그 소유권을 탈중앙화된 형태로 확인할 수 있도록 해놓은 것

NFT가 '대체 불가능 토큰'이라 불리는 이유는 내가 가진 1비트코인은 다른 사람이 가진 1비트코인과 1:1로 교환이 가능하다. 반면 NFT는 각기 연결된 디지털 자산이 달라 다른 NFT와의 1:1 교환이 성립하지 않는다. 그래서 비트코인이나 이더리움 같은 암호화폐는 'Fungible Token(대체 가능 토큰, 일명 ERC-20 토큰)'으로, NFT는 '대체 불가능 토큰(일명, ERC-721 토큰)'으로 불린다. _출처 : 코인데스크코리아 (http://www.coindeskkorea.com/news/articleView.html?idxno=73064)_

(왼쪽)JPG파일이 783억원에 낙찰. 미국 디지털 아티스트 비플(Beeple·본명 마이크 윈켈만)의 디지털 아트 콜라주인 '매일: 처음의 5000일'(EVERYDAYS: THE FIRST 5000 DAYS)이 6934만 달러에 낙찰

(오른쪽)트위터 공동 창업자 잭 도시가 15년 전 작성한 이 첫 트윗('태초의 트윗')의 소유권을 인증하는 대체불가능토큰(NFT·Non-fungible token)이 경매에서 약 290만달러(약 32억7000만원)에 낙찰됐다.

<figure style="display:flex;">
<img src="http://res.heraldm.com/content/image/2021/03/11/20210311000896_0.jpg"  style="max-width:400px;" alt="http://res.heraldm.com/content/image/2021/03/11/20210311000896_0.jpg" /> <img src="https://img.hankyung.com/photo/202103/01.25807736.1.jpg"  style="max-width:400px;"alt="https://img.hankyung.com/photo/202103/01.25807736.1.jpg" />
</figure>

**NFT 시장 규모**

[KOTRA 해외시장뉴스](https://news.kotra.or.kr/user/globalBbs/kotranews/782/globalBbsDataView.do?setIdx=243&dataIdx=188333)

---

# 파이썬으로 블록체인 구현해보기

```python
# 1
import hashlib
import time
import json

# print(hashlib.sha256('나는바보'.encode()).hexdigest()) # 64글자
# print(hashlib.sha256('나는바보,'.encode()).hexdigest())
# print(hashlib.sha256('나는바보.'.encode()).hexdigest())

class Block():
    def __init__(self, index, timestamp, data):
        #블록 인덱스 값
        self.index = index
        #블록 생성 시간
        self.timestamp = timestamp
        # 블록 저장된 데이터, 트랜젝션 등
        self.data = data
        # 이전 블록 해쉬값
        self.prevhash = 0
        self.nonce = 0
        # 현재 블록 해쉬 값
        self.hash = self.calHash()

    def calHash(self):
        #sha256에 들어갈 수 있는 데이터 타입은 byte이므로
        # string으로 변환 후 encode로 변환
        # 해쉬값을 16진수로 표현하기 위해 hexdigest
        return hashlib.sha256(str(self.index).encode() + str(self.data).encode() +
                            str(self.nonce).encode() + str(self.timestamp).encode() + str(self.prevhash).encode()).hexdigest()

    def mine(self, difficulty):
        ans = ["0"]*difficulty
        answer = "".join(ans)
        # 00000으로 시작하는 hash값이 만들어질때까지
        while str(self.hash)[:difficulty] != answer:
            self.nonce += 1
            self.hash = self.calHash()
        return self.hash

class BlockChain:
    def __init__(self, ):
        self.chain = []
        # 난이도 설정 : 0을 5개로 시작
        self.difficulty = 5
        self.createGenesis()

    def createGenesis(self):
        # time.titme()으로 timestamp값
        # time 모듈의 time() 함수는 현재 Unix timestamp을 소수로 리턴. 정수부는 초단위, 소수부는 마이크로(micro) 초단위.
        self.chain.append(Block(0, time.time(), 'Genesis Block'))

    # 생성된 블록 체인 추가 시,
    def addBlock(self, nBlock):
        # 이전 해시값과
        nBlock.prevhash = self.chain[len(self.chain)-1].hash
        # 현재 해시값을
        nBlock.hash = nBlock.mine(self.difficulty)
        # 체인에 추가
        self.chain.append(nBlock)

    def getLatestBlock(self):
        return self.chain[len(self.chain)-1]

    # 체인 유효성 검사는
    def isValid(self):
        i = 1
        while i<len(self.chain):
            # 현재 블록의 해쉬 값과 계산된 해쉬값의 비교
            if self.chain[i].hash != self.chain[i].calHash():
                return False
            #  현재 블록이 가지고 있는 이전 블록해쉬값과 이전 블록에 저장되어 있는 해쉬값 비교
            if self.chain[i].prevhash != self.chain[i-1].hash:
                return False
            i += 1
        return True

onion = BlockChain()
onion.addBlock(Block(len(onion.chain),time.time(), "2nd stranscation"))
onion.addBlock(Block(len(onion.chain),time.time(), {"3rd": "send 100BTC to Cho's wallet."}))
for block in onion.chain:
    # vars는 객체의 어트리뷰트(함수나 변수)를 돌려줌
    # python 객체를 JSON 문자열로 변환하기 위해서 dumps()함수 사용
    # indent 들여쓰기 정도
    print(json.dumps(vars(block), indent=2))

onion.chain[2].data = {"3rd": "send 1BTC to Cho's wallet."}
print('Chain is OK?', onion.isValid())

```

## Source

[Welcome to ICO of KOREA : 네이버 블로그](https://blog.naver.com/seonggi159/221288795802)

[ETRI Webzine VOL.127_Special](https://www.etri.re.kr/webzine/20190329/sub01.html)

[쉽게 설명하는 블록체인 : 블록체인의 원리 - 채굴, 해시 그리고 작업증명 | 뱅크샐러드](https://www.banksalad.com/contents/%EC%89%BD%EA%B2%8C-%EC%84%A4%EB%AA%85%ED%95%98%EB%8A%94-%EB%B8%94%EB%A1%9D%EC%B2%B4%EC%9D%B8-%EB%B8%94%EB%A1%9D%EC%B2%B4%EC%9D%B8%EC%9D%98-%EC%9B%90%EB%A6%AC-%EC%B1%84%EA%B5%B4-%ED%95%B4%EC%8B%9C-%EA%B7%B8%EB%A6%AC%EA%B3%A0-%EC%9E%91%EC%97%85%EC%A6%9D%EB%AA%85-qvCud)

[#2 - 해시함수란 무엇인가? - Steemit](https://steemit.com/kr/@yahweh87/2)

[분산원장과 블록체인 차이 / 분산원장기술이란?](https://m.blog.naver.com/seonggi159/221312537621)

[하나금융, 은행권 블록체인 물꼬 텄다](http://www.fntimes.com/html/view.php?ud=20160425003812151975_18&mobile=1)

[블록체인의 역사 | Binance Academy](https://academy.binance.com/ko/articles/history-of-blockchain)

[](https://paullabkorea.github.io/jupyternotebookblog/blockchain/python/2021/09/20/_09_20_blockchain_in_python.html)

[python으로 간단한 블록체인 만들기 (1) - Steemit](https://steemit.com/kr/@pangol/python-1)
