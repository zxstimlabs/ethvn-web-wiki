/**
 * Words of the home hero, shared by the wide and the tall (phone) versions:
 * the six story steps, what each "+" explains, the guided tour order and the
 * wiki pages each topic links to. Positions live in `layout.ts`.
 */

import { T, activeSteps } from '@/lib/hero/timeline';

export const STEPS = [
  {
    title: 'Gửi giao dịch',
    body: 'Ví ký giao dịch và gửi tới nút qua RPC. Lớp thực thi của nút kiểm tra chữ ký và số dư, rồi đưa giao dịch vào mempool (hàng chờ giao dịch).',
    tone: 'tx',
  },
  {
    title: 'Lan truyền',
    body: 'Nút chuyển tiếp giao dịch cho các nút ngang hàng qua mạng P2P. Chỉ vài giây sau, giao dịch có trong mempool của hầu hết mạng lưới, kể cả của người xây khối.',
    tone: 'tx',
  },
  {
    title: 'Đấu giá khối',
    body: 'Nhiều người xây khối (block builder) cùng xếp giao dịch thành khối rồi trả giá qua một nút relay. Giá là số ETH họ trả cho người đề xuất, và tăng dần khi có thêm giao dịch.',
    tone: 'block',
  },
  {
    title: 'Đề xuất khối',
    body: 'Mỗi khe (slot) 12 giây có một người đề xuất được chọn ngẫu nhiên; ở đây là trình xác thực trong nút. MEV-Boost lấy giá cao nhất từ nút relay, trình xác thực ký, nút relay công bố khối và khối nối vào chuỗi.',
    tone: 'block',
  },
  {
    title: 'Chứng thực',
    body: 'Một ủy ban (1/32 số trình xác thực) bỏ phiếu chứng thực (attestation) cho khối đầu chuỗi. Không cần 2/3 cho từng khối: khối vào chuỗi ngay khi người đề xuất ký và công bố.',
    tone: 'vote',
  },
  {
    title: 'Tính cuối cùng: 2/3',
    body: 'Mỗi kỷ nguyên (epoch, 32 khe), mọi trình xác thực bỏ một phiếu. Khi phiếu đạt 2/3 tổng ETH đặt cọc, mốc của kỷ nguyên được chứng minh (justified). Hai mốc liền nhau cùng đạt 2/3 thì mốc trước đạt tính cuối cùng (finality).',
    tone: 'vote',
  },
] as const;

export const STILL_STEPS = activeSteps(T.still);

export const CAPTION =
  'Ví dụ minh hoạ: nút của một người tự đặt cọc, có trình xác thực được chọn làm người đề xuất ở khe này. Thực tế mỗi khe chọn ngẫu nhiên trong toàn bộ trình xác thực, và phần lớn khối được xây qua MEV-Boost như trên. Mỗi khối được kể trong 12 giây thật, rồi tua nhanh tới khi khối đạt tính cuối cùng. Số khe và kỷ nguyên theo đồng hồ mainnet; thanh 2/3 giả định 99% trình xác thực bỏ phiếu đúng hạn; giao dịch và giá thầu là minh hoạ.';

export const SCENE_TITLE = 'Một khối Ethereum được tạo ra, đấu giá, ký, nối vào chuỗi và đạt tính cuối cùng';
export const SCENE_DESC =
  'Ví gửi giao dịch tới nút của một trình xác thực. Lớp thực thi đưa giao dịch vào mempool và lan truyền qua mạng P2P tới các nút khác và người xây khối. Người xây khối trả giá qua một nút relay; MEV-Boost của nút chọn giá cao nhất, trình xác thực ký, nút relay công bố khối và khối nối vào chuỗi. Ủy ban chứng thực bỏ phiếu cho khối. Sau đó phần tua nhanh cho thấy phiếu của mọi trình xác thực qua từng kỷ nguyên: khi đạt 2/3 tổng ETH đặt cọc, mốc kỷ nguyên được chứng minh, và hai mốc liền nhau đạt 2/3 thì khối đạt tính cuối cùng.';

// ── what each "+" explains ───────────────────────────────────────────────

/**
 * `rel`: a "+" in the middle of a connection, explaining the relationship.
 * `item`: a mini "+" next to a part.
 * `group` is the scene layer the button sits on (network buttons dim with the network in the fast-forward).
 */
export interface InfoText {
  id: string;
  kind: 'rel' | 'item';
  group: 'net' | 'committee' | 'chain';
  title: string;
  via: string;
  body: string;
}

const RELATIONS: Omit<InfoText, 'kind'>[] = [
  {
    id: 'wallet-rpc',
    group: 'net',
    title: 'Ví → Nút (RPC)',
    via: 'JSON-RPC · eth_sendRawTransaction',
    body: 'Ví ký giao dịch bằng khóa riêng tư ngay trên thiết bị, rồi gửi bản đã ký tới nút qua RPC. Nút có thể là của bạn hoặc của nhà cung cấp RPC. Nút không giữ khóa của bạn và không thể sửa giao dịch đã ký.',
  },
  {
    id: 'execution',
    group: 'net',
    title: 'Trong lớp thực thi: RPC → Mempool → P2P',
    via: 'execution client (Geth, Nethermind, Reth…)',
    body: 'Lớp thực thi kiểm tra chữ ký, nonce và số dư đủ trả phí. Giao dịch hợp lệ vào mempool để chờ được đưa vào khối, đồng thời được chuyển cho các nút khác.',
  },
  {
    id: 'p2p',
    group: 'net',
    title: 'Nút → Nút khác (P2P)',
    via: 'devp2p · mạng ngang hàng của lớp thực thi',
    body: 'Các nút nối với nhau thành mạng ngang hàng, không có máy chủ trung tâm. Mỗi nút báo giao dịch mới cho vài nút lân cận, các nút đó báo tiếp. Chỉ vài giây là giao dịch lan khắp mạng, nên người đề xuất nào cũng có thể đưa nó vào khối.',
  },
  {
    id: 'peer-builder',
    group: 'net',
    title: 'Nút khác → Người xây khối',
    via: 'mempool công khai + giao dịch gửi riêng',
    body: 'Người xây khối cũng chạy nút nên thấy mempool công khai. Họ còn nhận giao dịch gửi thẳng tới họ, không qua mempool (private orderflow). Từ đó họ chọn và sắp xếp giao dịch sao cho khối đáng giá nhất.',
  },
  {
    id: 'builder-relay',
    group: 'net',
    title: 'Người xây khối → Nút relay',
    via: 'API của relay',
    body: 'Người xây khối gửi khối kèm giá thầu (số ETH sẽ trả cho người đề xuất) tới nút relay. Relay kiểm tra khối hợp lệ và trả đúng như hứa, rồi chỉ cho người đề xuất xem phần đầu khối (header), chưa lộ giao dịch bên trong. Người xây khối phải tin relay không lấy cắp khối của họ.',
  },
  {
    id: 'consensus',
    group: 'net',
    title: 'Trong lớp đồng thuận: Validator → Beacon → MEV-Boost',
    via: 'Beacon API · Builder API',
    body: 'Trình xác thực giữ khóa ký nhưng không tự nói chuyện với mạng. Nó nhờ beacon node (lớp đồng thuận) tạo khối, và beacon node hỏi MEV-Boost. Nếu không có giá thầu tốt, beacon node tự lấy khối từ lớp thực thi của chính nút.',
  },
  {
    id: 'mev-relay',
    group: 'net',
    title: 'MEV-Boost ↔ Nút relay',
    via: 'Builder API · getHeader → submitBlindedBlock',
    body: 'Đầu khe, MEV-Boost của nút hỏi các nút relay giá cao nhất và nhận về phần đầu khối. Trình xác thực ký phần đầu khối đó khi chưa thấy giao dịch bên trong (ký mù). Chỉ khi có chữ ký, relay mới gửi phần thân khối và công bố.',
  },
  {
    id: 'relay-chain',
    group: 'net',
    title: 'Nút relay → Chuỗi khối',
    via: 'libp2p · mạng ngang hàng của lớp đồng thuận',
    body: 'Nút relay công bố khối đầy đủ, nút của người đề xuất cũng phát đi. Từ đó mọi nút chuyển tiếp (relay) khối cho nhau qua P2P, và mỗi nút tự kiểm tra lại khối (chữ ký, giao dịch, trạng thái) trước khi nối vào chuỗi của mình. Không nút nào phải tin relay.',
  },
  {
    id: 'attest',
    group: 'committee',
    title: 'Ủy ban → Khối đầu chuỗi',
    via: 'chứng thực · gộp chữ ký BLS',
    body: 'Mỗi khe, khoảng 1/32 số trình xác thực được giao bỏ phiếu. Mỗi phiếu chứng thực nói hai điều: khối nào là đầu chuỗi, và mốc kỷ nguyên nào là đúng. Chữ ký của nhiều phiếu được gộp lại cho gọn rồi đưa vào các khối sau.',
  },
  {
    id: 'parent',
    group: 'chain',
    title: 'Khối → Khối trước',
    via: 'mã băm khối cha (parent hash)',
    body: 'Mỗi khối ghi mã băm (hash) của khối liền trước. Sửa một giao dịch cũ sẽ đổi mã băm của khối chứa nó và làm đứt liên kết với mọi khối phía sau. Muốn sửa quá khứ thì phải làm lại tất cả các khối sau đó.',
  },
  {
    id: 'finality',
    group: 'chain',
    title: 'Mốc đạt tính cuối cùng ← Mốc đủ 2/3',
    via: 'Casper FFG',
    body: 'Khối đầu mỗi kỷ nguyên là một mốc. Khi phiếu cho mốc đạt 2/3 tổng ETH đặt cọc, mốc được chứng minh (justified). Khi mốc kế tiếp cũng đạt 2/3, mốc trước đạt tính cuối cùng: muốn đảo ngược phải mất ít nhất 1/3 số ETH đặt cọc.',
  },
];

const ITEMS: Omit<InfoText, 'kind'>[] = [
  {
    id: 'wallet',
    group: 'net',
    title: 'Ví',
    via: 'khóa riêng tư · cụm từ khôi phục',
    body: 'Ví không chứa tiền: tài sản nằm trên chuỗi khối. Ví giữ khóa riêng tư để ký giao dịch, và ai có khóa (hoặc cụm từ khôi phục) là có toàn quyền với tài sản. Vì vậy không bao giờ đưa cụm từ khôi phục cho ai.',
  },
  {
    id: 'node',
    group: 'net',
    title: 'Nút trình xác thực',
    via: 'lớp thực thi + lớp đồng thuận',
    body: 'Một nút Ethereum là hai phần mềm chạy cùng nhau: lớp thực thi xử lý giao dịch và giữ trạng thái, lớp đồng thuận theo dõi khối và phiếu bầu. Người đặt cọc chạy thêm phần mềm trình xác thực, và có thể chạy MEV-Boost.',
  },
  {
    id: 'rpc',
    group: 'net',
    title: 'RPC',
    via: 'JSON-RPC',
    body: 'Cổng để ví và ứng dụng nói chuyện với nút: đọc số dư, ước tính phí, gửi giao dịch. Dùng RPC của nhà cung cấp thì bạn tin họ trả lời đúng; chạy nút riêng thì bạn tự kiểm chứng được.',
  },
  {
    id: 'mempool',
    group: 'net',
    title: 'Mempool',
    via: 'hàng chờ giao dịch',
    body: 'Nơi giữ các giao dịch hợp lệ chưa vào khối. Mỗi nút có mempool riêng, nên không có một danh sách chung duy nhất. Giao dịch trả phí ưu tiên cao hơn thường được chọn trước.',
  },
  {
    id: 'p2p-module',
    group: 'net',
    title: 'P2P',
    via: 'devp2p',
    body: 'Mỗi nút giữ kết nối với vài chục nút khác để trao đổi giao dịch. Không có máy chủ trung tâm, nên tắt bớt vài nút thì mạng lưới vẫn chạy.',
  },
  {
    id: 'validator',
    group: 'net',
    title: 'Validator (trình xác thực)',
    via: 'khóa ký · ETH đặt cọc',
    body: 'Phần mềm giữ khóa ký của người đã đặt cọc từ 32 ETH. Nó ký khối khi được chọn đề xuất, và ký một phiếu chứng thực mỗi kỷ nguyên. Ký hai khối mâu thuẫn cho cùng một khe sẽ bị phạt nặng (slashing).',
  },
  {
    id: 'beacon',
    group: 'net',
    title: 'Beacon node',
    via: 'consensus client (Lighthouse, Prysm, Teku…)',
    body: 'Lớp đồng thuận: theo dõi khối và phiếu, chọn đầu chuỗi dựa trên phiếu bầu, và điều khiển lớp thực thi qua Engine API. Trình xác thực dựa vào nó để biết khi nào phải đề xuất hay bỏ phiếu.',
  },
  {
    id: 'mev',
    group: 'net',
    title: 'MEV-Boost',
    via: 'phần mềm tùy chọn',
    body: 'Chạy bên cạnh beacon node, cho người đề xuất bán quyền xây khối cho người trả giá cao nhất, thường kiếm được nhiều hơn tự xây khối. Đánh đổi: phải tin nút relay, và việc xây khối dồn vào ít bên hơn.',
  },
  {
    id: 'peers',
    group: 'net',
    title: 'Nút khác',
    via: 'hàng nghìn nút',
    body: 'Hàng nghìn nút trên khắp thế giới, do cá nhân, công ty và tổ chức chạy. Mỗi nút giữ một bản sao chuỗi khối và tự kiểm tra mọi khối, nên không ai một mình sửa được lịch sử.',
  },
  {
    id: 'builders',
    group: 'net',
    title: 'Người xây khối',
    via: 'block builder',
    body: 'Các bên chuyên tối ưu khối: chọn và sắp thứ tự giao dịch để thu phí và MEV (giá trị có được nhờ thứ tự giao dịch). Hiện chỉ vài người xây khối lớn tạo ra phần lớn khối trên Ethereum.',
  },
  {
    id: 'relay',
    group: 'net',
    title: 'Nút relay (MEV-Boost)',
    via: 'nút trung gian do bên thứ ba vận hành',
    body: 'Một nút do bên chuyên làm relay vận hành, như Flashbots hay Ultra Sound. Ngoài phần mềm relay, nó chạy một nút đầy đủ (beacon) để kiểm tra khối của người xây khối và công bố khối thắng. Nó giữ kín khối tới khi người đề xuất ký, và bảo đảm người đề xuất được trả đúng giá. Nút trình xác thực không tự làm việc này mà dùng MEV-Boost để hỏi relay.',
  },
  {
    id: 'committee',
    group: 'committee',
    title: 'Ủy ban chứng thực',
    via: '1/32 số trình xác thực mỗi khe',
    body: 'Mỗi kỷ nguyên, mọi trình xác thực được chia vào 32 khe, mỗi khe một ủy ban. Bỏ phiếu đúng hạn thì được thưởng, bỏ lỡ thì bị trừ một ít. Hình chỉ vẽ 7, thực tế mỗi khe có hàng chục nghìn trình xác thực.',
  },
  {
    id: 'chain',
    group: 'chain',
    title: 'Chuỗi khối',
    via: 'mỗi khe 12 giây',
    body: 'Mỗi khối có phần đầu (số khe, người đề xuất, mã băm khối cha, gốc trạng thái) và phần thân (giao dịch, phiếu chứng thực). Khối đầu chuỗi là khối mới nhất trên nhánh được nhiều phiếu ủng hộ nhất. Khe nào người đề xuất vắng mặt thì không có khối.',
  },
  {
    id: 'justified',
    group: 'chain',
    title: 'Mốc đủ 2/3 (justified)',
    via: 'Casper FFG',
    body: 'Khối đầu kỷ nguyên đã nhận phiếu từ 2/3 tổng ETH đặt cọc. Chưa đạt tính cuối cùng, nhưng đã rất khó bị thay thế. Khi mốc tiếp theo cũng đủ 2/3, mốc này đạt tính cuối cùng.',
  },
  {
    id: 'finalized',
    group: 'chain',
    title: 'Mốc đạt tính cuối cùng (finalized)',
    via: 'không thể đảo ngược',
    body: 'Khối này và mọi khối trước nó đã đạt tính cuối cùng. Muốn đảo ngược, ít nhất 1/3 số ETH đặt cọc phải vi phạm luật và sẽ bị đốt, tức hàng triệu ETH. Nhiều cầu nối chờ tới mốc này mới coi giao dịch là chắc chắn.',
  },
  {
    id: 'gauge',
    group: 'chain',
    title: 'Phiếu cho mốc kỷ nguyên',
    via: 'tính theo ETH đặt cọc',
    body: 'Thanh cộng dồn phiếu của kỷ nguyên hiện tại theo số ETH đặt cọc, không theo số người. Vượt 2/3 thì mốc được chứng minh khi hết kỷ nguyên. Đây là mô hình giả định 99% trình xác thực bỏ phiếu đúng hạn, không phải số liệu trực tiếp.',
  },
];

/** Everything a "+" can open: relationships on the lines, and details next to parts. */
export const INFO: InfoText[] = [
  ...RELATIONS.map((r) => ({ ...r, kind: 'rel' as const })),
  ...ITEMS.map((r) => ({ ...r, kind: 'item' as const })),
];
export const INFO_BY_ID: Record<string, InfoText> = Object.fromEntries(INFO.map((i) => [i.id, i]));

/** Guided order for "Tiếp →": follows a transaction from the wallet to finality. */
export const TOUR = [
  'wallet',
  'wallet-rpc',
  'node',
  'rpc',
  'execution',
  'mempool',
  'p2p-module',
  'p2p',
  'peers',
  'peer-builder',
  'builders',
  'builder-relay',
  'relay',
  'mev-relay',
  'mev',
  'consensus',
  'beacon',
  'validator',
  'relay-chain',
  'chain',
  'parent',
  'committee',
  'attest',
  'gauge',
  'justified',
  'finality',
  'finalized',
];

/** Wiki pages that already cover a topic. Topics without a page get no link (no "coming soon" dead ends). */
const READ = {
  wallet: { href: '/tai-lieu/can-ban/bat-dau/vi-va-tai-khoan', label: 'Ví, tài khoản và cụm từ khôi phục' },
  network: { href: '/tai-lieu/can-ban/bat-dau/ethereum-la-gi#mạng-lưới-ethereum', label: 'Mạng lưới Ethereum' },
  chain: { href: '/tai-lieu/can-ban/cach-hoat-dong/chuoi-khoi', label: 'Chuỗi khối là gì?' },
  pos: { href: '/tai-lieu/can-ban/cach-hoat-dong/dong-thuan#bằng-chứng-cổ-phần', label: 'Đồng thuận: bằng chứng cổ phần' },
  validators: { href: '/tai-lieu/can-ban/cach-hoat-dong/trinh-xac-thuc', label: 'Trình xác thực' },
  signature: { href: '/tai-lieu/can-ban/cach-hoat-dong/chu-ky-so', label: 'Chữ ký số' },
  block: { href: '/tai-lieu/can-ban/cach-hoat-dong/khoi', label: 'Khối' },
  finality: { href: '/tai-lieu/can-ban/cach-hoat-dong/khoi#khi-nào-khối-không-thể-đảo-ngược', label: 'Tính cuối cùng' },
  node: { href: '/tai-lieu/can-ban/cach-hoat-dong/nut', label: 'Nút' },
};
export const MORE: Record<string, { href: string; label: string }> = {
  wallet: READ.wallet,
  'wallet-rpc': READ.signature,
  node: READ.node,
  rpc: READ.node,
  peers: READ.network,
  p2p: READ.network,
  'p2p-module': READ.network,
  mempool: READ.block,
  execution: READ.block,
  builders: READ.block,
  'relay-chain': READ.block,
  validator: READ.validators,
  committee: READ.validators,
  attest: READ.pos,
  chain: READ.chain,
  parent: READ.chain,
  justified: READ.finality,
  finalized: READ.finality,
  finality: READ.finality,
  gauge: READ.finality,
};

/** Per-viewer convenience: which "+" this browser has opened. Shared by both versions. */
export const SEEN_KEY = 'eth-hero-seen';
