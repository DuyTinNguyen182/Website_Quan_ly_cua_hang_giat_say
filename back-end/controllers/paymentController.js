const payos = require("../config/payOS");
const Order = require("../models/Order");

// Generate a unique order code for PayOS (must be number < 9007199254740991)
const generateOrderCode = () => {
    return Number(String(Date.now()).slice(-6) + Math.floor(Math.random() * 1000));
};

exports.createPaymentLink = async (req, res) => {
    try {
        const { orderCode, amount, description, returnUrl, cancelUrl } = req.body;

        if (!amount || !description) {
            return res.status(400).json({ error: "Amount and description are required" });
        }

        // Tạo orderCode ngẫu nhiên hoàn toàn mới cho mỗi lần tạo mã QR
        const payosOrderCode = generateOrderCode();

        const body = {
            orderCode: payosOrderCode,
            amount: Number(amount),
            description: description.substring(0, 25), // PayOS limit description length
            returnUrl: returnUrl || "http://localhost:5173", // Frontend URL callback
            cancelUrl: cancelUrl || "http://localhost:5173"
        };

        const paymentLinkResponse = await payos.paymentRequests.create(body);

        // Lưu payos_order_code vào CSDL để khi có webhook trả về ta biết nó thuộc đơn nào
        if (orderCode) {
            await Order.findOneAndUpdate(
                { order_code: String(orderCode) },
                { payos_order_code: payosOrderCode }
            );
        }

        return res.status(200).json({
            success: true,
            checkoutUrl: paymentLinkResponse.checkoutUrl,
            qrCode: paymentLinkResponse.qrCode,
            paymentLinkId: paymentLinkResponse.id,
        });
    } catch (error) {
        console.error("PayOS Create Payment Error:", error);
        return res.status(500).json({ error: "Failed to create payment link" });
    }
};

exports.receiveWebhook = async (req, res) => {
    try {
        const webhookData = req.body;
        
        // Xác thực chữ ký webhook bằng SDK mới @payos/node
        // payos.webhooks.verify() trả về data nếu hợp lệ, throw nếu sai chữ ký
        const data = await payos.webhooks.verify(webhookData);

        if (webhookData.code === "00" && data) {
            const payosOrderCode = data.orderCode;

            // Thanh toán thành công - Cập nhật trạng thái đơn hàng trong DB
            // Tìm theo payos_order_code mới thêm hoặc cả order_code (cho các đơn cũ)
            const order = await Order.findOneAndUpdate(
                {
                    $or: [
                        { payos_order_code: Number(payosOrderCode) },
                        { order_code: String(payosOrderCode) }
                    ]
                },
                {
                    payment_status: "PAID",
                    payment_method: "BANK"
                },
                { new: true }
            );

            if (order) {
                console.log(`[Webhook] Cập nhật thành công thanh toán Đơn hàng: ${order.order_code}`);
            } else {
                console.log(`[Webhook] CẢNH BÁO: Đã nhận thanh toán nhưng không tìm thấy đơn hàng ${payosOrderCode} trong DB.`);
            }
        }

        return res.json({ error: 0, message: "Webhook received", data: webhookData.data });
    } catch (error) {
        console.error("Webhook Error:", error.message);
        return res.status(400).json({ error: error.message || "Webhook Error" });
    }
};
