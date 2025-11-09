export function speak(text) {
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ar-SA"; u.rate = 0.9; u.pitch = 1; u.volume = 1;
  window.speechSynthesis.speak(u);
}

export function announce(clinicName, num) {
  const toWords = n => {
    const a = ["صفر","واحد","اثنان","ثلاثة","أربعة","خمسة","ستة","سبعة","ثمانية","تسعة","عشرة"];
    return n <= 10 ? a[n] : n;
  };
  speak(`على العميل رقم ${toWords(num)} التوجه إلى عيادة ${clinicName}`);
}

export function speakReset() {
  speak("تمت إعادة التعيين");
}