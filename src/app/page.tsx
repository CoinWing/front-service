"use client"

import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen">
      <div className="relative w-full h-screen snap-start">
        <div className="relative w-full h-[60%] overflow-hidden">
          <img
            src="/coin.webp"
            alt="Crypto Background"
            className="w-full h-full object-cover absolute top-0 left-0 z-0"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 z-10" />
          <div className="relative z-20 flex items-center h-full px-6">
            <div className="max-w-4xl space-y-4">
              <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold text-left leading-snug">
                실제 시장처럼, 리스크 없이 —<br />
                지금 모의투자를 시작해보세요.
              </h1>
              <p className="text-white text-xs sm:text-sm text-left leading-relaxed">
                실제 시장과 유사한 환경에서 실시간 가상 자산 거래를 시뮬레이션하고<br />
                정밀한 분석으로 나의 투자 성과를 확인해보세요.<br />
                가상 코인으로 투자 전략을 자유롭게 연습할 수 있습니다.
              </p>
              <div className="flex justify-start gap-4 mt-6">
                <Link href="/exchange">
                  <button className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md shadow hover:bg-blue-700 transition">
                    지금 바로 시작하세요
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="px-6 py-2 bg-white text-blue-700 border border-blue-700 text-sm font-semibold rounded-md shadow hover:bg-blue-50 transition">
                    회원가입
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="relative w-full h-[40%] bg-white px-6 py-6 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-blue-900 text-xl sm:text-xl md:text-2xl font-bold leading-snug">
                처음이라면, 실전보다 중요한 연습부터
              </h2>
              <p className="text-sm sm:text-xs md:text-sm text-gray-800 leading-relaxed max-w-4xl mx-auto">
                실제 암호화폐 시장의 실시간 시세를 반영한 가상 거래 환경에서, 생생한 투자 경험을 쌓아보세요.<br />
                단순한 클릭이 아닌, 실전과 유사한 조건에서 매수·매도를 연습하며 실력을 키울 수 있습니다.<br />
                누적된 거래 데이터를 분석해 전략을 복기하고 개선할 수 있는 기회를 제공합니다.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {[
                { icon: "📈", text: "실시간 시세 반영" },
                { icon: "💵", text: "실전과 유사한 투자 경험" },
                { icon: "📊", text: "상세한 성과 분석" },
                { icon: "💣", text: "무위험 학습 기회" },
              ].map((item, index) => (
                <div key={index} className="flex items-center p-3 bg-white rounded-xl shadow-md shadow-blue-200">
                  <div className="text-2xl mr-3">{item.icon}</div>
                  <div className="text-sm font-medium text-blue-900">{item.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-full h-screen bg-blue-50 flex items-center justify-center px-6 py-12">
        <div className="max-w-6xl w-full flex flex-col items-center text-center space-y-6">
          <div className="text-4xl sm:text-5xl font-extrabold text-blue-900 opacity-90">01</div>
          <h2 className="text-blue-950 text-2xl sm:text-3xl md:text-4xl font-bold leading-snug">
            투자 정보와 차트를 한 화면에!
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl">
            4단 화면 구성으로 종목 검색, 차트, 호가, 매수/매도 기능을<br className="hidden sm:block" />
            한 번에 전환 없이 빠르게 이용하세요.
          </p>
          <img
            src="/temporary exchange.png"
            alt="투자 화면 예시"
            className="w-full max-w-md sm:max-w-lg rounded-xl shadow-md"
          />
        </div>
      </div>

      <div className="relative w-full h-screen snap-start bg-white flex items-center justify-center px-6 py-12">
        <div className="max-w-6xl w-full flex flex-col items-center text-center space-y-6">

          <div className="text-4xl sm:text-5xl font-extrabold text-blue-900 opacity-90">02</div>
          <h2 className="text-blue-950 text-2xl sm:text-3xl md:text-4xl font-bold leading-snug">
            나의 모든 거래, 투명하게 기록!
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl">
            거래 날짜, 매수/매도 가격, 수량, 수익률까지<br className="hidden sm:block" />
            모든 투자 내역을 표로 정리해 한눈에 보여드립니다.
          </p>
          <img
            src="/temporary exchange.png"
            alt="투자 내역 예시"
            className="w-full max-w-md sm:max-w-lg rounded-xl shadow-md"
          />
        </div>
      </div>

      <div className="relative w-full h-screen bg-blue-50 flex items-center justify-center px-6 py-12">
        <div className="max-w-6xl w-full flex flex-col items-center text-center space-y-6">
          <div className="text-4xl sm:text-5xl font-extrabold text-blue-900 opacity-90">03</div>
          <h2 className="text-blue-950 text-2xl sm:text-3xl md:text-4xl font-bold leading-snug">
            내 자산 현황을 한눈에!
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl">
            보유 중인 코인, 전체 수익률, 수익/손실 내역까지<br className="hidden sm:block" />
            한눈에 확인할 수 있는 스마트 포트폴리오 기능.
          </p>
          <img
            src="/temporary exchange.png"
            alt="자산 현황 예시"
            className="w-full max-w-md sm:max-w-lg rounded-xl shadow-md"
          />
        </div>
      </div>

      <div className="relative w-full h-[50vh] px-6 py-10 bg-blue-50 flex flex-col items-center justify-center">
        <div className="flex-1 flex items-center justify-center w-full">
          <div className="max-w-4xl w-full mx-auto space-y-8 text-center">
            <h2 className="text-blue-950 text-2xl sm:text-3xl font-bold leading-snug">
              실전 같은 연습, 지금부터 시작하세요!<br />
              리스크 없이 투자 감각을 키워보는 가장 스마트한 방법
            </h2>
            <div className="flex justify-center flex-wrap gap-4">
              <Link href="/exchange">
                <button className="px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-md shadow hover:bg-blue-700 transition">
                  지금 바로 시작하세요
                </button>
              </Link>
              <Link href="/signup">
                <button className="px-6 py-3 bg-white text-blue-700 border border-blue-700 text-sm font-semibold rounded-md shadow hover:bg-blue-50 transition">
                  회원가입
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
