// lifestyle-data.js
// 근거 있는 생활습관 정보 — 공공기관 자료를 확인해 사람이 직접 채운다.
//
// 채우는 방법
//   질병관리청 국가건강정보포털(health.kdca.go.kr) 등에서 해당 주제를 찾아
//   문장을 옮기고, source에 출처 이름을, checked에 확인한 연월을 적는다.
//
// 문장 규칙
//   - title 은 짧은 명사형, body 는 존댓말 한 문장으로 통일한다.
//   - title 은 "~하지 않기"보다 "~하기" 형태를 쓴다.
//     (금지형으로 시작하면 어르신이 지적받는 느낌을 받을 수 있다.)
//   - "굶다", "무리하다", "게으르다"처럼 나무라는 뉘앙스의 말을 쓰지 않는다.
//   - source 에는 기관 이름만 쓴다. 문서 이름은 주석에만 남긴다.
//     (화면에 문서 이름이 뜨면 어르신이 그 병이라고 오해할 수 있다.)
//   - "침대" 대신 "잠자리"를 쓴다. (요를 깔고 주무시는 분이 많다.)
//   - 체중 감량, 강도 높은 운동, 특정 체형을 전제하는 문구는 넣지 않는다.
//     (마르셨거나 기운이 없는 어르신에게도 안전한 문장만 남긴다.)
//   - 한 배열 안에 "지금 바로 할 수 있는 것"이 최소 하나는 들어가야 한다.
//     전부 회피·환경 개선으로만 채우지 않는다.
//   - 몸을 많이 쓰는 집안일(빨래, 대청소 등)은 권하지 않는다.
//     (70대에게는 실행 부담이 크다.)
//   - 어르신 본인의 노력·의지·주의력을 요구하는 문장을 쓰지 않는다.
//     (예: 집중하기, 신경 쓰기, 잊지 않기, 참기)
//   - 대신 환경이나 물건을 바꾸는 문장으로 쓴다.
//     (예: TV 끄기, 불 켜기, 물건 치우기)
//     노력을 요구하면 못 했을 때 어르신이 자책하게 된다.
//   - 같은 배열 안에서 제목이 서로 비슷해지지 않게 한다.
//   - lifestyle-data.js 의 문구가 tea-data.js 의 차 카드와 같은 화면에서
//     모순되지 않는지 항상 확인한다.
//     (예: "차 줄이기"는 차를 안내하는 화면에서 쓸 수 없다.
//      카페인 차와 무카페인 차를 구분해 쓴다.)
//
// 항목 형식
//   { title: "규칙적인 수면 시간 지키기",
//     body:  "매일 같은 시각에 잠자리에 들고 일어나십시오.",
//     source:"질병관리청 국가건강정보포털",
//     checked:"2026-08" }
//   // 출처 문서: … > … (cntnts_sn=…)
//   // https://health.kdca.go.kr/…
//
// 주의
//   - 출처 없이 내용을 채우지 않는다. 출처 표기가 이 파일의 존재 이유다.
//   - AI가 임의로 문장을 만들어 넣지 않는다.
//   - energy(기운·어지럼), mood(기분), unknown(잘 모르겠다)은 비워둔다.
//     이 항목들은 안내 없이 기록만 한다.
//   - 배열이 비어 있으면 화면에서 "집에서 해보실 것" 묶음 자체를 감춘다.

const LIFESTYLE_DATA = {
  // 골관절염·요통·근감소증(근 손실)·낙상 — 국가건강정보포털 건강정보에서
  // 생활습관·운동·예방 내용만 발췌 (병명은 화면 문구에 넣지 않음).
  pain: [
    {
      // 출처 문서: 골관절염 > 생활습관 관리 > 운동요법 및 바른 자세 (cntnts_sn=1988)
      // https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=1988
      title: "아프지 않은 만큼만 움직이기",
      body:  "다음날 일상에 지장이 될 만큼 아프지 않은 범위에서, 가볍게 몸을 움직여 보십시오.",
      source: "질병관리청 국가건강정보포털",
      checked: "2026-08"
    },
    {
      // 출처 문서: 요통 > 생활습관 교정 (cntnts_sn=3796)
      // https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=3796
      title: "허리를 곧게 쓰기",
      body:  "무거운 것을 들거나 앉았다 일어날 때 허리가 구부러지지 않게 하십시오.",
      source: "질병관리청 국가건강정보포털",
      checked: "2026-08"
    },
    {
      // 출처 문서: 근 손실 > 운동 요법 (cntnts_sn=6722)
      // https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=6722
      title: "일주일에 두세 번 근력 운동하기",
      body:  "일주일에 두세 번, 아프지 않은 만큼만 근육에 힘을 주는 운동을 해보십시오.",
      source: "질병관리청 국가건강정보포털",
      checked: "2026-08"
    },
    {
      // 출처 문서: 낙상 > 예방 (cntnts_sn=1743)
      // https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=1743
      title: "욕실 바닥 물기 닦기",
      body:  "욕실·화장실 바닥 물기는 바로 닦고, 미끄럽지 않게 하십시오.",
      source: "질병관리청 국가건강정보포털",
      checked: "2026-08"
    }
  ],
  // 소화불량·변비·위식도역류질환 — 국가건강정보포털에서
  // 식사습관·생활습관만 발췌 (병명은 화면 문구에 넣지 않음).
  stomach: [
    {
      // 출처 문서: 기능성 소화불량 > 자주하는 질문 > 굶는 것 (cntnts_sn=6263)
      // https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=6263
      title: "끼니 거르지 않기",
      body:  "속이 더부룩하셔도 끼니는 거르지 마십시오.",
      source: "질병관리청 국가건강정보포털",
      checked: "2026-08"
    },
    {
      // 출처 문서: 위식도역류질환 > 생활습관 관리 > 식습관 (cntnts_sn=2057)
      // https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=2057
      title: "조금씩 나눠 드시기",
      body:  "한 번에 많이 드시지 말고 조금씩 여러 번 나눠 드십시오.",
      source: "질병관리청 국가건강정보포털",
      checked: "2026-08"
    },
    {
      // 출처 문서: 변비 > 생활습관 관리 > 식사 > 식이섬유·수분 (cntnts_sn=5827)
      // https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5827
      title: "채소와 물 충분히",
      body:  "채소·잡곡을 곁들이고, 하루 종일 물을 충분히 마시십시오.",
      source: "질병관리청 국가건강정보포털",
      checked: "2026-08"
    },
    {
      // 출처 문서: 위식도역류질환 > 생활습관 관리 > 식사와 수면 (cntnts_sn=2057)
      // https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=2057
      title: "밥 먹고 쉬었다 자기",
      body:  "저녁 식사 후 바로 눕지 말고, 잠자리에 들기 전에 한두 시간 쉬십시오.",
      source: "질병관리청 국가건강정보포털",
      checked: "2026-08"
    }
  ],
  // 만성기침(기침 성인)·만성폐쇄성폐질환·천식(알레르기 환경관리) — 생활·환경·예방만 발췌
  breath: [
    {
      // 출처 문서: 기침(성인) > 만성 기침 > 악화 요인 (cntnts_sn=6253)
      // https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=6253
      title: "연기 없는 곳에 있기",
      body:  "담배 연기나 매운 냄새가 있는 곳에서는 기침이 더 나옵니다.",
      source: "질병관리청 국가건강정보포털",
      checked: "2026-08"
    },
    {
      // 출처 문서: 만성폐쇄성폐질환 > 생활습관 관리 > 식사 (cntnts_sn=6536)
      // https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=6536
      title: "채소·과일 곁들이기",
      body:  "오늘 식사에 채소나 과일을 조금 곁들여 보십시오.",
      source: "질병관리청 국가건강정보포털",
      checked: "2026-08"
    },
    {
      // 출처 문서: 만성폐쇄성폐질환 > 생활습관 관리 (cntnts_sn=6536)
      // https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=6536
      title: "공기 탁할 때 밖에 덜 나가기",
      body:  "미세먼지나 대기 오염이 심한 날에는 밖에 나서는 시간을 줄여 보십시오.",
      source: "질병관리청 국가건강정보포털",
      checked: "2026-08"
    },
    {
      // 출처 문서: 만성폐쇄성폐질환 > 생활습관 관리 (cntnts_sn=6536)
      // https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=6536
      title: "청소할 때 환기하기",
      body:  "집안을 청소하실 때는 창문을 열어 환기하고, 마스크를 쓰시면 좋습니다.",
      source: "질병관리청 국가건강정보포털",
      checked: "2026-08"
    },
    {
      // 출처 문서: 알레르기 > 치료 > 환경관리 > 침구 관리 (cntnts_sn=5806)
      // https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5806
      title: "이불은 햇볕에",
      body:  "이불과 베개는 가끔 햇볕에 널어 말려주십시오.",
      source: "질병관리청 국가건강정보포털",
      checked: "2026-08"
    }
  ],
  sleep: [
    {
      // 출처 문서: 만성피로증후군 > 자가관리 > 수면 습관 (cntnts_sn=6549)
      // https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=6549
      title: "비슷한 시각에 자고 일어나기",
      body:  "매일 비슷한 시각에 눕고, 비슷한 시각에 일어나십시오.",
      source: "질병관리청 국가건강정보포털",
      checked: "2026-08"
    },
    {
      // 출처 문서: 만성피로증후군 > 자가관리 > 수면 습관 (cntnts_sn=6549)
      // https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=6549
      title: "방을 어둡고 조용하게",
      body:  "주무실 때는 불을 끄고 소리를 줄이며, 너무 덥거나 춥지 않게 하십시오.",
      source: "질병관리청 국가건강정보포털",
      checked: "2026-08"
    },
    {
      // 출처 문서: 만성피로증후군 > 자가관리 > 수면 습관 (cntnts_sn=6549)
      // https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=6549
      title: "잠자리는 잘 때만",
      body:  "잠자리에서 텔레비전을 보거나 낮에 오래 누워 계시지 마십시오.",
      source: "질병관리청 국가건강정보포털",
      checked: "2026-08"
    },
    {
      // 출처 문서: 만성피로증후군 > 자가관리 > 수면 습관 (cntnts_sn=6549)
      // https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=6549
      title: "자기 전에는 쉬기",
      body:  "잠들기 몇 시간 전부터는 심한 운동이나 많이 드시는 것을 피하십시오.",
      source: "질병관리청 국가건강정보포털",
      checked: "2026-08"
    }
  ],
  // 노인성난청·노안·안구건조증 — 생활·환경·예방만 발췌
  // (백내장 전용 문서는 포털에서 찾지 못함)
  eyeear: [
    {
      // 출처 문서: 노인성난청 > 위험요인 및 예방 (cntnts_sn=5489)
      // https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5489
      title: "볼륨은 조금만",
      body:  "텔레비전이나 라디오를 너무 크게 듣지 마시고, 시끄러운 소리는 가급적 피하십시오.",
      source: "질병관리청 국가건강정보포털",
      checked: "2026-08"
    },
    {
      // 출처 문서: 노안 > 치료 > 습관 및 환경 개선 (cntnts_sn=5226)
      // https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5226
      title: "글 볼 때 밝게 하기",
      body:  "신문이나 책을 보실 때 주변 불을 밝히면 덜 힘드십니다.",
      source: "질병관리청 국가건강정보포털",
      checked: "2026-08"
    },
    {
      // 출처 문서: 노인성난청 > 생활습관 관리 > 대화 예절 (cntnts_sn=5489)
      // https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5489
      title: "소리 줄이고 얼굴 보며",
      body:  "이야기 나누실 때는 텔레비전을 끄고, 말하는 분의 얼굴을 보십시오.",
      source: "질병관리청 국가건강정보포털",
      checked: "2026-08"
    },
    {
      // 출처 문서: 안구건조증 > 자가 관리 > 디지털기기 사용 조절 (cntnts_sn=6306)
      // https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=6306
      title: "30분마다 눈 쉬기",
      body:  "텔레비전이나 휴대폰을 오래 보셨으면 잠시 눈을 감고 쉬어 주십시오.",
      source: "질병관리청 국가건강정보포털",
      checked: "2026-08"
    }
  ],
  // 요실금(과민성방광 포함)·배뇨 관련 증상·전립선비대증(성별 무관 생활습관만) —
  // 생활·배뇨·수분 내용만 발췌 (과민성방광 전용 문서는 포털에서 찾지 못함)
  urine: [
    {
      // 출처 문서: 요실금 > 위험요인 및 예방 > 음식 조절 (cntnts_sn=5822)
      // https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5822
      title: "커피와 녹차는 조금만",
      body:  "커피, 녹차, 홍차를 드시면 소변이 더 자주 마려울 수 있습니다.",
      source: "질병관리청 국가건강정보포털",
      checked: "2026-08"
    },
    {
      // 출처 문서: 전립선비대증 > 치료 > 대기관찰요법 > 수분섭취 (cntnts_sn=3193)
      // 배뇨 관련 증상 또는 이상 > 치료 > 저장증상·저장기능이상 (cntnts_sn=6272)
      // https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=3193
      // https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=6272
      title: "물은 낮에 넉넉히",
      body:  "물은 낮에 넉넉히 드시고, 저녁 늦게만 조금 줄이십시오.",
      source: "질병관리청 국가건강정보포털",
      checked: "2026-08"
    },
    {
      // 출처 문서: 전립선비대증 > 치료 > 대기관찰요법 > 배뇨 습관 (cntnts_sn=3193)
      // https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=3193
      title: "잠자리 전 화장실",
      body:  "잠자리에 들기 전에 화장실에 다녀오시면 밤에 덜 깨실 수 있습니다.",
      source: "질병관리청 국가건강정보포털",
      checked: "2026-08"
    },
    {
      // 출처 문서: 요실금 > 위험요인 및 예방 > 금연 (cntnts_sn=5822)
      // https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5822
      title: "담배 연기 멀리",
      body:  "담배 연기는 기침을 일으켜 소변이 새기 쉬워집니다.",
      source: "질병관리청 국가건강정보포털",
      checked: "2026-08"
    }
  ],

  energy:  [],   // 기운·어지럼 — 비워둘 것
  mood:    [],   // 기분 — 비워둘 것
  unknown: []    // 잘 모르겠다 — 비워둘 것
};
