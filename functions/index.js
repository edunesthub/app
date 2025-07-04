const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendOrderNotification = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();
    const token = order.customerToken;

    if (!token) {
      console.log('No customer token found for order', context.params.orderId);
      return null;
    }

    const payload = {
      notification: {
        title: 'Order Placed Successfully!',
        body: `Your order (${context.params.orderId}) is being processed.`,
      },
      data: {
        orderId: context.params.orderId,
        status: 'pending'
      }
    };

    try {
      const response = await admin.messaging().sendToDevice(token, payload);
      console.log('Notification sent successfully:', response);
    } catch (error) {
      console.error('Error sending notification:', error);
    }

    return null;
  });
