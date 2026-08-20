# So sánh chi phí chức năng gọi thoại/video

## WebRTC peer-to-peer (PeerJS) — KHUYẾN NGHỊ cho nền tảng này
- PeerJS cloud server MIỄN PHÍ (peerjs.com có cloud miễn phí, không cần server)
- Cuộc gọi 1-1 P2P: media đi trực tiếp giữa 2 trình duyệt, KHÔNG qua server → không tốn phí băng thông/thuê phút
- Chỉ cần tín hiệu (signaling) — có thể dùng sẵn socket/MongoDB hoặc server API hiện có của Next.js
- Nhược điểm: NAT/firewall nặng cần STUN/TURN server (Coturn tự host ~5-10$/tháng hoặc free TURN công cộng hạn chế); chất lượng phụ thuộc mạng 2 bên; không có tính năng họp nhóm lớn, ghi hình, hiệu ứng nền
- Độ phức tạp: trung bình — ~1-2 ngày dev: tạo room, offer/answer, UI call modal với camera/mic toggle, mute, hangup

## Cloud có phí (Daily.co / Agora / LiveKit / Twilio)
- Daily: 10.000 phút miễn phí/tháng (free tier), sau đó ~4$/1000 phút video — rất rẻ cho quy mô nhỏ
- Agora: ~3.99$/1000 phút video, audio rẻ hơn
- LiveKit Cloud: free tier giới hạn, pay-as-you-go
- Ưu: chất lượng ổn (có SFU relay), tính năng phong phú (màn hình, hiệu ứng, ghi hình), không lo NAT/TURN
- Nhược: thêm dependency thứ 3, tốn phí khi scale (VD 1000h/tháng ~ 40-50$/tháng video)

## Khuyến nghị cho TửTế Fund (giao tiếp creator-backer, 1-1)
- Phương án WebRTC P2P tự build (PeerJS) = 0$ chi phí vận hành, đủ nhu cầu
- Nếu muốn đảm bảo chất lượng mọi mạng: + Coturn server (~6$/tháng) hoặc dùng Daily free tier làm fallback

## Trạng thái UI hiện tại
- ChatWindow đã có icon gọi thoại + gọi video (button hint "Gọi thoại"/"Gọi video") chưa gắn handler — cần gắn vào modal call UI
