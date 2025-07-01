"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


export default function Password() {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const router = useRouter();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    alert("비밀번호가 변경되었습니다.");
    router.push("/mypage");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-1">비밀번호 변경</h2>
      <p className="text-gray-600 mb-8">보안을 위해 개인정보를 안전하게 보호하세요</p>

      <div className="space-y-6">
        <div className="flex items-center">
          <label className="w-40 text-gray-800">현재 비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호를 입력하세요"
            className="flex-1 border border-gray-300 p-2 rounded"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
          />
        </div>

        <div className="flex items-center">
          <label className="w-40 text-gray-800">새 비밀번호</label>
          <input
            type="password"
            placeholder="새 비밀번호를 입력하세요"
            className="flex-1 border border-gray-300 p-2 rounded"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
          />
        </div>

        <div className="flex items-center">
          <label className="w-40 text-gray-800">새 비밀번호 확인</label>
          <input
            type="password"
            placeholder="새 비밀번호를 한번 더 입력하세요"
            className="flex-1 border border-gray-300 p-2 rounded"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
          />
        </div>
      </div>

      <hr className="my-8 border-gray-300" />

      <div className="text-sm text-gray-500 leading-relaxed mb-6">
        비밀번호는 도난방지, 보안설정을 위하여 3개월~6개월 사이에 주기적으로 변경하는 것이 안전합니다.
        <br />
        8~16자의 영문 대/소문자, 숫자, 특수기호를 조합하여 사용할 수 있습니다.
        <br />
        생년월일, 전화번호 등 개인정보와 관련된 숫자, 연속된 숫자, 연속된 키보드 배열과 같이 쉬운 비밀번호는 자제바랍니다.
        <br />
        현재 사용했던 비밀번호와 동일한 비밀번호로 변경할 수 없습니다.
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded"
      >
        확인
      </button>
    </form>
  );
}

