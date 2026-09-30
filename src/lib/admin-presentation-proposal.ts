import type { PresentationSlide } from "@/lib/admin-presentation-types";

/** Phu luc de xuat du an — thang 9/2026. Gan sau slide hoc thuat tren admin. */
export const PROPOSAL_SLIDES: PresentationSlide[] = [
  {
    variant: "hero",
    kicker: "De xuat du an",
    title: "Tu Te Fund",
    titleAccent: "Y tuong – Cong dong – Thi truong – Nguon luc",
    body: "Kiem chung y tuong · Huy dong nguon luc · Xay dung cong dong · Dong hanh cung Startup. Ban de xuat tong hop — thang 9/2026.",
    cards: [
      { title: "Tu mot y tuong", body: "den mot cong dong.", tone: "emerald" },
      { title: "Tu mot cong dong", body: "den mot thi truong.", tone: "emerald" },
      { title: "Tu mot thi truong", body: "den mot doanh nghiep.", tone: "emerald" },
    ],
  },
  {
    kicker: "De xuat",
    title: "1. Tom tat du an",
    body: "Nen tang cong nghe giup ca nhan, nhom sang tao, Startup, ho kinh doanh va doanh nghiep nho dua y tuong den gan cong dong va thi truong ngay tu nhung giai doan dau.",
    paragraphs: [
      {
        text: "Nen tang ket hop gay quy cong dong, dat truoc san pham, Blog, Chat, thao luan, tuong tac va ho so uy tin trong mot he sinh thai thong nhat.",
      },
      {
        text: "Gia tri cot loi khong nam o viec huy dong tien, ma o viec dua cong dong va tin hieu thi truong tham gia som hon vao qua trinh hinh thanh san pham.",
      },
    ],
    bullets: [
      "Y tuong → Cong dong → Kiem chung → Gay quy / Dat truoc → Nghien cuu & San xuat → Thi truong → Thu hoi von → Tai dau tu",
    ],
  },
  {
    kicker: "De xuat",
    title: "2. Boi canh va van de",
    body: "Rui ro lon nhat khong chi la thieu von, ma la san pham duoc tao ra truoc khi biet thi truong co thuc su can hay khong.",
    blocks: [
      {
        heading: "Nguoi tao du an",
        headingTone: "navy",
        bullets: [
          "Kho tiep can von ban dau va khach hang dau tien.",
          "Phai dau tu nghien cuu, phat trien, san xuat truoc khi biet thi truong chap nhan hay khong.",
          "Thieu du lieu kiem chung, moi truong trao doi va nguoi dong hanh.",
          "Kho xay dung uy tin va luu hanh trinh dai han.",
        ],
      },
      {
        heading: "Cong dong",
        headingTone: "emerald",
        bullets: [
          "Kho tiep can du an khi y tuong con dang hinh thanh.",
          "Chi tham gia khi san pham da hoan thien.",
          "Kho theo doi tien do va minh bach.",
          "It co hoi dong gop vao qua trinh hinh thanh san pham.",
        ],
      },
    ],
  },
  {
    kicker: "De xuat",
    title: "3. Muc tieu du an",
    body: "Xay dung nen tang so giup kiem chung y tuong, huy dong nguon luc, xay dung cong dong va phat trien quan he voi thi truong ngay tu giai doan dau.",
    cards: [
      { title: "1. Kiem chung nhu cau", body: "Do muc do quan tam truoc khi dau tu san xuat quy mo lon." },
      { title: "2. Huy dong nguon luc", body: "Gay quy khong nhan qua va dat truoc san pham." },
      { title: "3. Giam rui ro san xuat", body: "Dung tin hieu cong dong va don dat truoc de chot quy mo." },
      { title: "4. Xay dung cong dong", body: "Thao luan, phan hoi, theo doi va dong hanh lau dai." },
      { title: "5. Niem tin va uy tin", body: "Cong khai muc tieu, tien do, ket qua va hanh trinh." },
      { title: "6. Ha tang Startup", body: "Ket noi chuyen gia, doi tac, tai chinh, phap ly, marketing, cong nghe." },
    ],
  },
  {
    kicker: "De xuat",
    title: "4. Giai phap de xuat",
    body: "Dua cong dong va thi truong tham gia som hon vao vong doi phat trien san pham.",
    lanes: [
      {
        title: "Cach tiep can truyen thong",
        tone: "rose",
        steps: ["Y tuong", "Nghien cuu", "San xuat", "Tim thi truong"],
      },
      {
        title: "Cach tiep can Tu Te Fund",
        tone: "emerald",
        steps: [
          "Y tuong",
          "Cong dong",
          "Kiem chung",
          "Nghien cuu",
          "Gay quy / Dat truoc",
          "San xuat",
          "Thi truong",
          "Thu hoi von",
          "Tai dau tu",
        ],
      },
    ],
    bullets: [
      "Gioi thieu → Lang nghe → Thao luan → Kiem chung → Huy dong nguon luc → San xuat → Dua ra thi truong",
      "Cong dong khong chi la nguoi mua o cuoi qua trinh ma la mot phan cua qua trinh hinh thanh san pham.",
    ],
  },
  {
    kicker: "De xuat",
    title: "5. Hai hinh thuc cot loi",
    table: {
      headers: ["Hinh thuc", "Ban chat", "Phu hop voi", "Gia tri kiem chung"],
      rows: [
        [
          "Gay quy khong nhan qua",
          "Cong dong ho tro ma khong yeu cau nhan san pham",
          "Du an xa hoi, cong dong, thien nguyen, y tuong sang tao, Startup giai doan dau",
          "Do muc do tin tuong va san sang dong gop",
        ],
        [
          "Dat truoc san pham",
          "Nguoi dung dat san pham truoc khi san xuat hang loat",
          "San pham vat ly hoac so, ho kinh doanh, nhom sang tao",
          "Do nhu cau va quy mo thi truong truoc san xuat",
        ],
      ],
    },
    note: "Crowdfunding + Pre-order + Market Validation + Community tren cung mot nen tang.",
  },
  {
    kicker: "De xuat",
    title: "6. Mo hinh hoat dong",
    steps: [
      { n: "01", t: "Y tuong", d: "Chia se van de, giai phap hoac dinh huong san pham." },
      { n: "02", t: "Cong dong", d: "Thao luan, dat cau hoi, dong gop y kien." },
      { n: "03", t: "Kiem chung", d: "Ghi nhan muc do quan tam va tin hieu nhu cau." },
      { n: "04", t: "Gay quy / Dat truoc", d: "Chon mot hinh thuc hoac ket hop ca hai." },
      { n: "05", t: "Nghien cuu va san xuat", d: "Dung nguon luc va du lieu de ra quyet dinh." },
      { n: "06", t: "Thi truong", d: "Uu tien nguoi da quan tam, sau do mo rong." },
      { n: "07", t: "Thu hoi von", d: "Doanh thu nuoi duong qua trinh phat trien." },
      { n: "08", t: "Tai dau tu", d: "Tai dau tu san pham, du an moi hoac y tuong tiep theo." },
    ],
    bullets: [
      "Tu: San xuat truoc → Tim khach sau",
      "Sang: Kiem chung nhu cau → Gay quy / Dat truoc → San xuat",
    ],
  },
  {
    kicker: "De xuat",
    title: "7–8. Gia tri cot loi va he sinh thai",
    cards: [
      {
        title: "Tiet kiem thoi gian va nguon luc",
        body: "Tiep can cong dong ngay khi y tuong hinh thanh. Han che dau tu vao san pham chua duoc kiem chung.",
        tone: "emerald",
      },
      {
        title: "Cong dong lanh manh",
        body: "Thao luan, chia se kien thuc, dong gop y tuong, dat cau hoi, nhan phan hoi, tim nguoi dong hanh.",
      },
      {
        title: "Ho so uy tin",
        body: "Luu y tuong ban dau, chien dich, san pham, thanh tich, hoat dong, phan hoi va cot moc — ky uc thuong hieu.",
      },
    ],
    bullets: [
      "Blog: kien thuc, cau chuyen du an, bai hoc.",
      "Chat va thao luan: trao doi truc tiep.",
      "Ho so ca nhan / thuong hieu: hanh trinh va uy tin.",
      "Theo doi du an sau khi chien dich ket thuc.",
      "Phan hoi bien cong dong thanh nguon kiem chung thuc te.",
    ],
  },
  {
    kicker: "De xuat",
    title: "9–11. Doi tuong, khac biet, doanh thu",
    table: {
      headers: ["Doi tuong", "Gia tri mang lai"],
      rows: [
        ["Nguoi tao / Startup", "Kiem chung nhu cau, huy dong nguon luc, phan hoi som, xay cong dong tu y tuong"],
        ["Ho kinh doanh / nhom sang tao", "Mo dat truoc, do nhu cau truoc san xuat, giam ton kho"],
        ["Cong dong / nguoi dung", "Tiep can y tuong som, dong gop, dong hanh, theo doi hanh trinh"],
        ["Doi tac / chuyen gia", "Ket noi du an phu hop khi he sinh thai mo rong"],
      ],
    },
    cards: [
      { title: "Cot loi", body: "Phi nen tang tren gay quy thanh cong va don dat truoc hoan tat." },
      { title: "Bo sung", body: "Phi dich vu gia tang: truyen thong, ket noi doi tac, cong cu nang cao." },
      { title: "Dai han", body: "Doanh thu tu ket noi chuyen gia, doi tac va ho tro Startup." },
    ],
  },
  {
    kicker: "De xuat",
    title: "12–15. Minh bach, cong nghe, lo trinh",
    blocks: [
      {
        heading: "Minh bach va rui ro",
        headingTone: "navy",
        bullets: [
          "Xac minh tai khoan truoc khi chien dich cong khai.",
          "Cong khai muc tieu, tien do, ket qua va cap nhat.",
          "Theo doi sau chien dich: san xuat, giao hang, su dung nguon luc.",
        ],
      },
      {
        heading: "Lo trinh",
        headingTone: "emerald",
        bullets: [
          "Giai doan 1 — da trien khai: chien dich, gay quy, dat truoc, thanh toan, ho so, quan tri.",
          "Giai doan 2 — dang trien khai: Blog, Chat, thao luan, theo doi, ho so uy tin.",
          "Giai doan 3 — dinh huong: ket noi doi tac, chuyen gia, nguon luc sau chien dich.",
          "Giai doan 4 — tam nhin: he sinh thai tu y tuong den thuong mai hoa.",
        ],
      },
    ],
    note: "Crowdfunding la diem khoi dau, khong phai diem ket thuc.",
  },
  {
    kicker: "De xuat",
    title: "16. KPI va chi so danh gia",
    table: {
      headers: ["Nhom", "Chi so"],
      rows: [
        ["Nen tang / Nguoi dung", "Tai khoan, nguoi dung hoat dong, ty le quay lai, du an tao va duoc duyet"],
        ["Thi truong / Tai chinh", "Tong gay quy, dat truoc, giao dich, doanh thu nen tang, ty le dat muc tieu"],
        ["Cong dong", "Bai viet, binh luan, cuoc tro chuyen, tuong tac, cong dong/du an con hoat dong"],
        ["Startup / Tac dong", "Startup tham gia, du an tiep tuc sau chien dich, ket noi chuyen gia/doi tac, san pham thuong mai hoa, ty le giao hang"],
      ],
    },
  },
  {
    variant: "close",
    kicker: "De xuat",
    title: "18–19. Tam nhin va ket luan",
    titleAccent: "Tu y tuong den doanh nghiep",
    body: "Giup moi y tuong co co hoi duoc lang nghe, duoc kiem chung va duoc phat trien.",
    bullets: [
      "Y tuong duoc ghi nhan.",
      "Cong dong duoc lang nghe.",
      "Du an duoc kiem chung.",
      "Thuong hieu duoc xay dung.",
      "Hanh trinh duoc luu giu.",
      "Nguon luc duoc ket noi.",
    ],
    paragraphs: [
      {
        text: "Khi do, crowdfunding khong con chi la mot cong cu huy dong von, ma tro thanh diem khoi dau cho mot vong phat trien lien tuc.",
      },
    ],
    note: "Kiem chung y tuong – Huy dong nguon luc – Xay dung cong dong – Dong hanh cung Startup",
  },
];
