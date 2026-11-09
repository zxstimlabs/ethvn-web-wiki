# Viết cho Wiki ETH.vn

Nội dung wiki nằm trong `content/docs/`. Bản nháp đầu tiên tham khảo nội dung của [ethereum.org](https://ethereum.org) (giấy phép MIT, xem [NOTICE.md](./NOTICE.md)), được viết lại cho người đọc Việt Nam chứ không dịch nguyên văn.

## Cấu trúc

Wiki chia theo người đọc thành năm mục. Người đọc chuyển mục bằng menu chọn ở đầu thanh bên (trên điện thoại: trong menu bên). Trang đầu của mục Căn bản (`/tai-lieu/can-ban`) cũng liệt kê các mục thành thẻ.

| Thư mục | Mục | Dành cho | Trạng thái |
|---|---|---|---|
| `can-ban/` | Căn bản | Mọi người: nội dung phổ thông, giải thích đơn giản, dễ hiểu | Đang viết. Có ba nhóm: Bắt đầu (`bat-dau/`), Cách hoạt động (`cach-hoat-dong/`), Dùng Ethereum (`dung-ethereum/`) |
| `nha-dau-tu/` | Nhà đầu tư | Người nắm giữ tài sản trên Ethereum | Trang giữ chỗ |
| `lap-trinh-vien/` | Lập trình viên | Người xây dựng ứng dụng | Trang giữ chỗ |
| `doanh-nghiep/` | Doanh nghiệp | Doanh nghiệp muốn dùng Ethereum | Đang viết |
| `chinh-phu/` | Chính phủ | Cơ quan nhà nước và khu vực công | Đang viết |

- **Mỗi mục là một thư mục gốc** trong `content/docs/`.
  - `meta.json` của nó có `"root": true`, cùng tên mục, mô tả (hiện trong menu chọn và trên thẻ) và biểu tượng.
  - Biểu tượng là tên một icon Lucide có trong `icons` của `lucide-react`. Ví dụ `Building2` không có, phải dùng `Building`.
  - `index.mdx` là trang đầu của mục.
- **Đường dẫn:** wiki nằm ở `/tai-lieu`, mỗi mục có đường dẫn riêng để chia sẻ và để công cụ tìm kiếm lập chỉ mục: `/tai-lieu/can-ban`, `/tai-lieu/can-ban/bat-dau/...`, `/tai-lieu/nha-dau-tu`… Đường dẫn là tên thư mục và tên tệp, nên đổi tên là đổi đường dẫn: nếu bài đã được chia sẻ, thêm chuyển hướng trong `next.config.mjs`.
- **Trong một mục**, gom bài thành nhóm bằng thư mục con có `meta.json` riêng, như `bat-dau/`.
- **Màu của mỗi mục** nằm trong `app/global.css` (`--section-<thư mục>`, cho cả nền sáng và tối). Thêm mục thì thêm màu.
- **Trang giới thiệu** dùng `<SectionCards />`, lấy danh sách mục từ các `meta.json` nên không phải sửa tay.

Bốn mục ngoài Căn bản hiện chỉ có một trang giữ chỗ (yêu cầu ngày 2026-11-08). Ngoài các trang đó, chỉ tạo trang khi đã có nội dung. Không để trang trống hoặc trang "sắp ra mắt".

Kế hoạch cũ, trước khi chia thành năm mục, có các nhóm Hướng dẫn, Ví ETH.vn, Ứng dụng, Kiến thức, An toàn, Thuật ngữ, Tham gia và Nhà phát triển. Chưa chốt các nhóm này thuộc mục nào.

## Quy ước tệp

- **Định dạng:** `.mdx`, theo cách Fumadocs xử lý MDX mặc định, để trang có thể chứa component tương tác minh họa ý tưởng.
  - Trong MDX, `<` và `{` là cú pháp. Muốn viết chúng như chữ thường thì đặt trong `` `code` `` hoặc viết `&lt;`, `\{`.
- **Tên tệp và thư mục:** tiếng Việt không dấu, chữ thường, nối bằng `-`. Ví dụ: `phi-gas.mdx`, `vi-va-tai-khoan.mdx`.
  - Không đặt thư mục tên `vi/`: trùng với mã ngôn ngữ tiếng Việt. Dùng `vi-ethvn/`, `vi-va-tai-khoan` v.v.
- **Frontmatter:**

  ```yaml
  ---
  title: Tiêu đề trang
  description: Một câu tóm tắt, hiện dưới tiêu đề và trong kết quả tìm kiếm.
  sources:            # trang ethereum.org đã tham khảo, để đối chiếu khi nguồn cập nhật
    - https://ethereum.org/gas/
  ---
  ```

- **Hộp lưu ý:** dùng component `<Callout>` của Fumadocs, kèm tiêu đề tiếng Việt:

  ```mdx
  <Callout type="warn" title="Cảnh báo">
  Không bao giờ chia sẻ cụm từ khôi phục.
  </Callout>
  ```

  | Loại | `type` | `title` |
  |---|---|---|
  | Ghi chú | `info` | Lưu ý |
  | Mẹo | `idea` | Mẹo |
  | Quan trọng | `warn` | Quan trọng |
  | Cảnh báo | `warn` | Cảnh báo |
  | Rủi ro mất tiền | `error` | Thận trọng |

- **Liên kết nội bộ:** đường dẫn tương đối tới tệp, ví dụ `[phí gas](./phi-gas.mdx)`. Fumadocs tự chuyển thành URL.
- **Component tương tác:** viết trong `components/`, đăng ký trong `components/mdx.tsx`, rồi dùng trong trang như `<TenComponent />`. Luôn có đoạn văn giải thích bên cạnh, để người đọc bản Markdown hoặc dùng công cụ AI vẫn hiểu.
- **Hình động isometric:** nằm trong `components/iso/` (ví dụ `<ChainScene />`, `<ContractScene />`), cùng phong cách và bảng màu với hình động trang chủ.
  - Mỗi hình dùng `IsoFigure` (`figure.tsx`), gồm khung hình, nút phát/tạm dừng và các bước chú thích. Bấm vào một bước để nhảy tới đó.
  - Hình vẽ là một hàm của thời gian `t`. Máy chủ vẽ sẵn một khung tĩnh (`poster`), nên trang không giật khi tải và người tắt chuyển động vẫn xem được.
  - Chữ trong hình nên ít và ngắn. Phần giải thích nằm ở các bước chú thích (chữ HTML, đọc rõ trên điện thoại) và trong bài.
- **Hình động trang chủ:** các ô "+" trong hình động liên kết tới trang wiki phù hợp (bảng `MORE` trong `components/hero/content.ts`, dùng chung cho bản máy tính và bản điện thoại). Khi thêm trang mới về một chủ đề có trong hình (MEV, relay, tính cuối cùng…), thêm liên kết vào đó.

## Văn phong

- Gọi người đọc là "bạn". Câu ngắn, ý rõ. Mỗi đoạn một ý.
- Giải thích bằng ví dụ đời thường trước, thuật ngữ sau.
- Lần đầu dùng thuật ngữ trong trang: tiếng Việt, kèm tiếng Anh trong ngoặc và in đậm. Ví dụ: **trình xác thực** (validator). Những lần sau chỉ dùng tiếng Việt.
- Dấu thanh đặt theo kiểu phổ biến: hóa, xóa, tùy, hòa.
- Số theo kiểu Việt Nam: `21.000`, `0,01`.
- Viết đúng với mạng chính (mainnet) hiện tại. Nâng cấp chưa ra mắt (ví dụ Glamsterdam) chỉ nhắc như kế hoạch, không mô tả như đã có.
- Không đưa lời khuyên đầu tư, không dự đoán giá. Không giới thiệu sàn giao dịch cụ thể.
- Thông tin pháp lý ở Việt Nam đang thay đổi: chỉ nhắc người đọc tìm hiểu quy định hiện hành, không khẳng định điều gì là hợp pháp hay không.
- Khi nói một dự án "chạy trên Ethereum", ghi rõ mạng: mạng chính, Layer 2 nào, hay một mạng khác (nhiều ví dụ hay được nhắc thực ra chạy trên Polygon hoặc Celo). Nói rõ dự án đang chạy, là thí điểm, hay đã dừng.
- Số liệu thị trường (stablecoin, TVL, số nút…) luôn kèm nguồn và ngày đọc.
- Mục Chính phủ và Doanh nghiệp dựa nhiều vào tài liệu của Quỹ Ethereum, vốn là bên vận động cho Ethereum. Giữ giọng trung lập: nêu cả giới hạn, dự án đã dừng, và quan điểm của phía khác. Mỗi trang ở hai mục này, và ở mục Nhà đầu tư, kết thúc bằng phần "Nguồn" (danh sách liên kết hiện trên trang), vì người đọc ở đây cần tự đối chiếu, và một số nguồn không có giấy phép mở nên chỉ được tóm tắt, không chép.
- Mục Nhà đầu tư trình bày luận điểm "ETH là tài sản lưu trữ giá trị" (Vitalik Buterin, tháng 11 năm 2026) như một luận điểm có tên tác giả, giải thích cho rõ và thuyết phục, nhưng luôn kèm rủi ro và quan điểm khác. Không khuyên mua bán, không dự đoán giá. Mọi số liệu giá, nguồn cung, đặt cọc đều ghi ngày.

## Thuật ngữ chuẩn

Dùng thống nhất trên toàn wiki (và trong ví ETH.vn). Phần lớn theo bản tiếng Việt của ethereum.org.

| Tiếng Anh | Dùng | Ghi chú |
|---|---|---|
| wallet | ví | |
| account | tài khoản | |
| address | địa chỉ | |
| private key | khóa riêng tư | |
| public key | khóa công khai | |
| recovery phrase, seed phrase, secret phrase, mnemonic | cụm từ khôi phục | Một thuật ngữ duy nhất cho cả bốn |
| keystore | tệp keystore | |
| hardware wallet | ví cứng | |
| self-custody | tự lưu ký | |
| exchange | sàn giao dịch | |
| transaction | giao dịch | |
| sign | ký | |
| broadcast | gửi lên mạng lưới | |
| gas, gas fee | phí gas | |
| base fee | phí cơ sở | |
| priority fee | phí ưu tiên | |
| burn | đốt | |
| block | khối | |
| blockchain | chuỗi khối | Có thể giữ "blockchain" trong ngoặc |
| node | nút | |
| peer | nút ngang hàng | Trong hình động: "nút khác" |
| execution layer / client | lớp thực thi | |
| consensus layer / client | lớp đồng thuận | |
| validator | trình xác thực | |
| proposer | người đề xuất | |
| block builder | người xây khối | |
| relay | relay | Giữ nguyên. Nói rõ là nút do bên thứ ba vận hành |
| MEV, MEV-Boost | MEV, MEV-Boost | Giữ nguyên |
| staking | đặt cọc | |
| proof of stake | bằng chứng cổ phần | |
| proof of work | bằng chứng công việc | |
| mining, miner | đào, thợ đào | Theo ethereum.org. Ethereum không còn đào từ 2022 |
| Byzantine Generals Problem | bài toán các vị tướng Byzantine | |
| Byzantine fault tolerance | khả năng chịu lỗi Byzantine | |
| Sybil attack | tấn công Sybil | Giải thích: một người giả làm nhiều người |
| 51% attack | tấn công 51% | |
| The Merge | The Merge | Giữ nguyên. Không có token "ETH2" |
| slashing | cắt tiền cọc (slashing) | ethereum.org dùng "phạt cắt giảm" |
| inactivity leak | trừ dần tiền cọc khi vắng mặt | Giải thích bằng lời, không dịch từng chữ |
| deposit contract | hợp đồng đặt cọc | ethereum.org dùng "hợp đồng tiền gửi" |
| home staking, liquid staking | đặt cọc tại nhà, đặt cọc thanh khoản | |
| client diversity | đa dạng phần mềm (client) | |
| gwei | gwei | Giữ nguyên. 1 gwei = một phần tỷ ETH |
| gas limit, max fee | giới hạn gas, phí tối đa | |
| attestation | chứng thực | |
| committee | ủy ban | |
| slot / epoch | khe / kỷ nguyên | Kèm tiếng Anh |
| checkpoint | mốc | |
| justified | được chứng minh | Kèm "(justified)" |
| finality, finalized | tính cuối cùng, đạt tính cuối cùng | Kèm "(finality)". Không viết "cuối cùng" đứng một mình vì dễ hiểu thành "sau chót" |
| mempool | mempool | Giải thích: hàng chờ giao dịch |
| hash | mã băm | Giải thích: "dấu vân tay" của dữ liệu |
| parent block | khối cha | |
| state root | gốc trạng thái | |
| digital signature | chữ ký số | |
| nonce | nonce | Giữ nguyên. Giải thích: số thứ tự giao dịch của tài khoản |
| replay attack | tấn công phát lại | |
| blind signing / clear signing | ký mù / ký rõ ràng | |
| EOA (externally owned account) | tài khoản do khóa điều khiển (EOA) | ethereum.org dùng "tài khoản thuộc sở hữu bên ngoài" |
| contract account | tài khoản hợp đồng | |
| deploy | triển khai | |
| revert | hoàn tác | Giao dịch bị hoàn tác vẫn mất phí gas cho phần đã chạy |
| composability | ghép nối được | |
| oracle | oracle | Giữ nguyên. Giải thích: dịch vụ đưa dữ liệu bên ngoài vào chuỗi khối |
| block explorer | trình khám phá khối | |
| transaction hash | mã băm giao dịch | |
| input data | dữ liệu đầu vào | |
| execution client, consensus client | phần mềm lớp thực thi, phần mềm lớp đồng thuận | ethereum.org dùng "máy khách", nhưng không thống nhất |
| full node, archive node, light client | nút đầy đủ, nút lưu trữ, nút nhẹ | |
| RPC (provider) | RPC, nhà cung cấp RPC | Giải thích: nút mà ví hỏi để đọc dữ liệu và gửi giao dịch |
| EIP, ERC | EIP (đề xuất cải tiến Ethereum), ERC | Giữ nguyên ký hiệu |
| network upgrade, hard fork | nâng cấp mạng lưới | Tránh "phân nhánh cứng" trong bài phổ thông |
| testnet | mạng thử nghiệm | |
| ERC-20 token, fungible | token ERC-20 | |
| NFT (non-fungible token) | NFT (token không thể thay thế) | |
| allowance, approve | hạn mức, cho phép chi tiêu | |
| wrapped token, WETH | token bọc, WETH | |
| account abstraction | trừu tượng hóa tài khoản | |
| smart wallet, smart account | ví thông minh, tài khoản thông minh | |
| social recovery | khôi phục qua người thân | ethereum.org dùng "khôi phục xã hội" |
| multisig | nhiều chữ ký | ethereum.org dùng "đa chữ ký" |
| passkey | passkey | Giữ nguyên |
| pseudonymous | công khai dưới bút danh | Không viết "ẩn danh": Ethereum không ẩn danh |
| stealth address | địa chỉ dùng một lần | ethereum.org dùng "địa chỉ ẩn danh", dễ hiểu nhầm |
| Layer 1, Layer 2 | Layer 1, Layer 2 | Giữ nguyên |
| rollup, optimistic rollup, ZK-rollup | rollup, rollup lạc quan, ZK-rollup | Giữ nguyên "rollup". Nói rõ "ZK" không có nghĩa là riêng tư |
| sequencer | bộ sắp xếp | |
| batch | lô | |
| fraud proof | bằng chứng gian lận | |
| validity proof | bằng chứng hợp lệ | |
| blob | blob | Giữ nguyên. Không dịch "khối dữ liệu" (ethereum.org) vì trùng với "khối" (block) |
| data availability | tính khả dụng của dữ liệu | |
| smart contract | hợp đồng thông minh | |
| dapp | ứng dụng phi tập trung (dapp) | |
| token, NFT, stablecoin | token, NFT, stablecoin | Giữ nguyên |
| Layer 2, L2 | Layer 2 | Giữ nguyên, có thể kèm "(lớp 2)" |
| bridge | cầu nối | |
| phishing | lừa đảo giả mạo | |
| block space | không gian khối | Chỗ trong mỗi khối dành cho giao dịch |
| credible neutrality | trung lập đáng tin | Luật không thiên vị ai, và ai cũng tự kiểm tra được điều đó |
| censorship resistance | chống kiểm duyệt | |
| inclusion list (FOCIL, EIP-7805) | danh sách bắt buộc đưa vào | Mới là kế hoạch (tháng 11 năm 2026) |
| escape hatch | lối thoát | Rút tài sản về Ethereum khi bên vận hành Layer 2 không hợp tác |
| validium | validium | Giữ nguyên. Dữ liệu không đăng lên Ethereum |
| permissioned / private chain | chuỗi riêng (chuỗi cấp phép) | |
| tokenization | token hóa | |
| real-world assets (RWA) | tài sản thực (RWA) | |
| compliance | tuân thủ | |
| allow-list | danh sách cho phép | |
| Ethereum Foundation (EF) | Quỹ Ethereum (EF) | Tổ chức phi lợi nhuận. Không vận hành hay kiểm soát Ethereum |
| public sector | khu vực công | |
| verifiable credential | chứng chỉ số kiểm chứng được | |
| issuer, holder, verifier | bên cấp, người giữ, bên kiểm tra | |
| decentralized identifier (DID) | định danh phi tập trung (DID) | |
| selective disclosure | tiết lộ có chọn lọc | |
| zero-knowledge proof | bằng chứng không kiến thức | |
| viewing key | khóa xem | |
| settlement finality | tính cuối cùng của thanh toán | Khái niệm pháp lý trong ngân hàng, khác tính cuối cùng của khối |
| store of value (SoV) | tài sản lưu trữ giá trị | |
| CROPS | CROPS | Giữ nguyên. Giải thích: chống kiểm duyệt và chống bị thâu tóm, mã nguồn mở, quyền riêng tư, an ninh |
| capture resistance | chống bị thâu tóm | |
| walkaway test | phép thử "rời đi vẫn chạy" | Theo tuyên bố sứ mệnh của Quỹ Ethereum |
| net present value (NPV) | giá trị hiện tại ròng | |
| discount rate | lãi suất chiết khấu | |
| issuance | phát hành mới | |
| ultrasound money | tiền siêu âm | Khẩu hiệu của cộng đồng, ethereum.org gọi là meme |
| ossification | cố định giao thức | |
| formal verification | kiểm chứng hình thức | |
| post-quantum | an toàn trước máy tính lượng tử | |
| statelessness | nút không cần giữ toàn bộ trạng thái | |
| DeFi | tài chính phi tập trung (DeFi) | |
| collateral, liquidation | tài sản bảo đảm, thanh lý | |

> **Lưu ý:** bản dịch hiện tại của ví ETH.vn dùng cả "cụm từ bí mật" và "cụm từ khôi phục". Cần thống nhất về "cụm từ khôi phục".
