# Bảng Kiểm Kê Màn Hình (Screen Inventory) - CultureTrail (BTL-26)

Tuân thủ nghiêm ngặt **Nguyên tắc số 2** (End-to-End Traceability Chain) và **Mục 1.2 Barem CSE122 V2** với đầy đủ 12 cột kiểm tra cho 16 màn hình độc lập (1 index.html tại gốc và 15 tệp trong `pages/`).

| TT | Role | User Goal | User Task | Screen Name | File Path | CRUD | States Coverage | AI Feature | Assignee | Task ID | Branch | OBS Video Link |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Chung | Cổng thông tin di sản | Điều hướng, tra cứu nhanh, chuyển vai trò | Trang chủ CultureTrail | `index.html` | Read | Normal, Loading | Trợ lý Văn hóa AI (Chat Widget) | SV1 | TSK-01 | main | [Video-SV1-01](https://youtu.be/culturetrail-demo-01) |
| 2 | Chung | Xác thực người dùng | Đăng nhập hệ thống đa vai trò | Đăng nhập & Xác thực | `pages/login.html` | Read, Create | Normal, Error | Không | SV1 | TSK-02 | main | [Video-SV1-02](https://youtu.be/culturetrail-demo-02) |
| 3 | Khám phá | Tìm hiểu di sản | Xem danh sách, tìm kiếm & lọc bài viết | Khám phá câu chuyện | `pages/explorer-story-discovery.html` | Read | Normal, Loading, Empty, Error | Không | SV2 | TSK-03 | main | [Video-SV2-03](https://youtu.be/culturetrail-demo-03) |
| 4 | Khám phá | Xem chi tiết địa danh | Khám phá lịch sử, xưởng gốm & ẩm thực | Chi tiết địa danh | `pages/explorer-place-detail.html` | Read | Normal, Empty | Không | SV1 | TSK-04 | main | [Video-SV1-04](https://youtu.be/culturetrail-demo-04) |
| 5 | Khám phá | Tra cứu nghệ nhân | Tìm kiếm và xem hồ sơ nghệ nhân | Danh sách nghệ nhân | `pages/explorer-creator-list.html` | Read | Normal, Loading, Empty | Không | SV1 | TSK-05 | main | [Video-SV1-05](https://youtu.be/culturetrail-demo-05) |
| 6 | Khám phá | Lập lịch trình du lịch | Tạo và lưu lịch trình văn hóa cá nhân hóa | Tuyến của tôi & AI Trail | `pages/explorer-my-trail.html` | CRUD | Normal, Loading, Empty, Error | **AI-1: Culture Trail Planner & Itinerary** | SV2 | TSK-06 | main | [Video-SV2-06](https://youtu.be/culturetrail-demo-06) |
| 7 | Nghệ nhân | Không gian sáng tác | Xem thông số bài viết, tạo & sửa bài | Quản lý câu chuyện | `pages/creator-story-management.html` | CRUD | Normal, Loading, Empty | Không | SV1 | TSK-07 | main | [Video-SV1-07](https://youtu.be/culturetrail-demo-07) |
| 8 | Nghệ nhân | Sáng tạo nội dung | Soạn thảo câu chuyện di sản & gắn tag | Tạo bài viết mới | `pages/creator-story-create.html` | Create | Normal, Error (Form Validation) | Gợi ý thẻ Tag AI | SV1 | TSK-08 | main | [Video-SV1-08](https://youtu.be/culturetrail-demo-08) |
| 9 | Nghệ nhân | Hồ sơ nghề | Trưng bày thông tin truyền nhân & sản phẩm | Hồ sơ nghệ nhân | `pages/creator-profile-view.html` | Read, Update | Normal | Không | SV1 | TSK-09 | main | [Video-SV1-09](https://youtu.be/culturetrail-demo-09) |
| 10 | Nghệ nhân | Tổ chức hoạt động | Quản lý workshop & lượt đặt chỗ | Quản lý sự kiện | `pages/creator-event-management.html` | CRUD | Normal, Loading, Empty | Không | SV2 | TSK-10 | main | [Video-SV2-10](https://youtu.be/culturetrail-demo-10) |
| 11 | Quản trị | Thẩm định di sản | Đánh giá chất lượng bài viết & duyệt | Kiểm duyệt nội dung | `pages/curator-content-review.html` | Update, Delete | Normal, Loading, Empty | **AI-2: Content Review Copilot & Risk Alert** | SV3 | TSK-11 | main | [Video-SV3-11](https://youtu.be/culturetrail-demo-11) |
| 12 | Quản trị | Tuyển tập di sản | Gom nhóm bài viết thành chuyên đề | Quản lý bộ sưu tập | `pages/curator-collection-management.html` | CRUD | Normal, Empty | Không | SV3 | TSK-12 | main | [Video-SV3-12](https://youtu.be/culturetrail-demo-12) |
| 13 | Quản trị | Trực quan hóa tọa độ | Tra cứu làng nghề trên bản đồ số | Bản đồ nội dung | `pages/curator-content-map.html` | Read | Normal, Empty | Không | SV3 | TSK-13 | main | [Video-SV3-13](https://youtu.be/culturetrail-demo-13) |
| 14 | Quản trị | Quản lý thực thể | Quản lý nhãn văn hóa, làng nghề, kỹ nghệ | Quản lý Tags | `pages/admin-tag-management.html` | CRUD | Normal, Empty | Không | SV2 | TSK-14 | main | [Video-SV2-14](https://youtu.be/culturetrail-demo-14) |
| 15 | Quản trị | Quản lý định danh | Duyệt hồ sơ nghệ nhân, khóa tài khoản | Quản lý người dùng | `pages/admin-user-management.html` | CRUD | Normal, Loading, Empty | Không | SV2 | TSK-15 | main | [Video-SV2-15](https://youtu.be/culturetrail-demo-15) |
| 16 | Quản trị | Điều hành di sản | Dự báo lưu lượng khách, rủi ro mai một | Dashboard Quản trị | `pages/admin-culture-dashboard.html` | Read, Update | Normal, Loading | **AI-3: Heritage Intelligence & Trend Copilot** | SV3 | TSK-16 | main | [Video-SV3-16](https://youtu.be/culturetrail-demo-16) |

*Ghi chú:* Toàn bộ 16 tệp trên đều có thể truy cập trực tiếp qua thanh điều hướng chung và bộ chuyển đổi vai trò (Role Switcher) ở góc dưới bên trái màn hình.
