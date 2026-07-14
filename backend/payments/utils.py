import logging
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

logger = logging.getLogger(__name__)

def send_order_confirmation_email(order, payment):
    """
    Sends a styled HTML confirmation email to the user upon successful payment verification.
    """
    if not order or not order.user or not order.user.email:
        logger.warning(f"Skipping order confirmation email for order {order.id if order else 'None'} due to missing user/email context.")
        return False

    subject = f"Order Confirmation - {order.order_number}"
    recipient_list = [order.user.email]
    
    # Context variables for rendering invoice details
    context = {
        'order': order,
        'payment': payment,
        'user': order.user,
        'items': order.items.all(),
    }

    try:
        # We can construct a visually appealing HTML template inline or render from templates
        # Since we want to ensure zero-config fallback, we will generate a robust inline HTML layout
        # which is responsive and includes styled cards.
        
        items_html = ""
        for item in order.items.all():
            variants = ""
            if item.variant_details:
                v_list = []
                if 'size' in item.variant_details:
                    v_list.append(f"Size: {item.variant_details['size']}")
                if 'color' in item.variant_details:
                    v_list.append(f"Color: {item.variant_details['color']}")
                if v_list:
                    variants = f"<br/><small style='color: #64748b;'>{', '.join(v_list)}</small>"
            
            items_html += f"""
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 12px 0; font-family: sans-serif; font-size: 14px; color: #1e293b;">
                    <strong>{item.product.name if item.product else 'Deleted Product'}</strong>{variants}
                </td>
                <td style="padding: 12px 0; text-align: center; font-family: sans-serif; font-size: 14px; color: #1e293b;">{item.quantity}</td>
                <td style="padding: 12px 0; text-align: right; font-family: sans-serif; font-size: 14px; color: #1e293b;">INR {float(item.price):.2f}</td>
            </tr>
            """

        shipping_addr = order.shipping_address or {}
        address_str = f"""
        {shipping_addr.get('full_name', '')}<br/>
        {shipping_addr.get('address_line_1', '')}<br/>
        {f"{shipping_addr.get('address_line_2', '')}<br/>" if shipping_addr.get('address_line_2') else ''}
        {shipping_addr.get('city', '')}, {shipping_addr.get('state', '')} - {shipping_addr.get('postal_code', '')}<br/>
        Phone: {shipping_addr.get('phone', '')}
        """

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <tr>
                    <td style="padding: 40px; background-color: #4f46e5; border-top-left-radius: 8px; border-top-right-radius: 8px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">Order Confirmed!</h1>
                        <p style="color: #c7d2fe; margin: 8px 0 0 0; font-size: 14px;">Thank you for shopping with DevStack.</p>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 40px;">
                        <h2 style="font-size: 18px; font-weight: 700; color: #1e293b; margin-top: 0; margin-bottom: 20px;">Order Details</h2>
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 30px;">
                            <tr>
                                <td style="padding: 4px 0; font-size: 14px; color: #64748b;">Order Number:</td>
                                <td style="padding: 4px 0; font-size: 14px; color: #1e293b; text-align: right; font-family: monospace; font-weight: 700;">{order.order_number}</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px 0; font-size: 14px; color: #64748b;">Transaction Date:</td>
                                <td style="padding: 4px 0; font-size: 14px; color: #1e293b; text-align: right;">{order.created_at.strftime('%Y-%m-%d %H:%M:%S UTC')}</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px 0; font-size: 14px; color: #64748b;">Payment Method:</td>
                                <td style="padding: 4px 0; font-size: 14px; color: #1e293b; text-align: right;">{order.payment_method}</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px 0; font-size: 14px; color: #64748b;">Transaction/Payment ID:</td>
                                <td style="padding: 4px 0; font-size: 14px; color: #1e293b; text-align: right; font-family: monospace;">{payment.razorpay_payment_id or payment.payment_id or 'COD'}</td>
                            </tr>
                        </table>

                        <h3 style="font-size: 16px; font-weight: 700; color: #1e293b; border-bottom: 2px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 0;">Purchased Items</h3>
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 30px;">
                            <thead>
                                <tr style="border-bottom: 2px solid #cbd5e1; text-align: left;">
                                    <th style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #475569;">Description</th>
                                    <th style="padding: 8px 0; text-align: center; font-size: 12px; font-weight: 700; color: #475569;">Qty</th>
                                    <th style="padding: 8px 0; text-align: right; font-size: 12px; font-weight: 700; color: #475569;">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items_html}
                            </tbody>
                        </table>

                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-left: auto; max-width: 250px; font-size: 14px; color: #1e293b; margin-bottom: 45px;">
                            <tr>
                                <td style="padding: 6px 0; color: #64748b;">Subtotal:</td>
                                <td style="padding: 6px 0; text-align: right;">INR {float(order.total_amount):.2f}</td>
                            </tr>
                            {f'''<tr>
                                <td style="padding: 6px 0; color: #16a34a;">Discount:</td>
                                <td style="padding: 6px 0; text-align: right; color: #16a34a;">-INR {float(order.discount_amount):.2f}</td>
                            </tr>''' if float(order.discount_amount) > 0 else ''}
                            <tr>
                                <td style="padding: 6px 0; color: #64748b;">Shipping:</td>
                                <td style="padding: 6px 0; text-align: right;">INR {float(order.shipping_charges):.2f}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #64748b;">Tax (GST):</td>
                                <td style="padding: 6px 0; text-align: right;">INR {float(order.tax_amount):.2f}</td>
                            </tr>
                            <tr style="border-top: 1px solid #cbd5e1; font-weight: 800; font-size: 16px;">
                                <td style="padding: 12px 0 0 0; color: #1e293b;">Grand Total:</td>
                                <td style="padding: 12px 0 0 0; text-align: right; color: #4f46e5;">INR {float(order.grand_total):.2f}</td>
                            </tr>
                        </table>

                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; border-radius: 6px; padding: 20px; font-size: 14px; line-height: 1.5; color: #334155;">
                            <tr>
                                <td>
                                    <strong style="color: #1e293b; display: block; margin-bottom: 8px;">Shipping Address:</strong>
                                    {address_str}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 24px; background-color: #f8fafc; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
                        <p style="margin: 0;">If you have any questions regarding this invoice, please contact support.</p>
                        <p style="margin: 4px 0 0 0;">&copy; 2026 DevStack. All rights reserved.</p>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """

        text_content = f"Order Confirmation {order.order_number}. Grand Total: INR {order.grand_total:.2f}. Thank you for shopping with DevStack!"

        # Send multi-part HTML email
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=recipient_list
        )
        email.attach_alternative(html_content, "text/html")
        email.send()
        
        logger.info(f"Order confirmation email sent successfully for order {order.order_number} to {order.user.email}.")
        return True

    except Exception as e:
        logger.error(f"Failed to send order confirmation email for order {order.order_number}: {e}")
        return False
