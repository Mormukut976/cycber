# PhonePe QR Code Setup

## How to Add Your PhonePe QR Code

### Option 1: Save QR Code Image
1. Save your PhonePe QR code image to: `client/images/phonepe-qr.png`
2. The payment page will automatically display it

### Option 2: Update payment.html
Open `client/payment.html` and find this line (around line 224):
```html
<img id="phonepe-qr" src="" alt="PhonePe QR Code"
```

Change it to:
```html
<img id="phonepe-qr" src="images/phonepe-qr.png" alt="PhonePe QR Code"
```

And in the JavaScript section (around line 378), update:
```javascript
const qrImg = document.getElementById('phonepe-qr');
qrImg.src = 'images/phonepe-qr.png';
qrImg.style.display = 'block';
placeholder.style.display = 'none';
```

### Current QR Code Details
- Name: MORMUKUT SINGH CHAUHAN
- UPI ID: 8000907924@paytm
- Payment Apps: PhonePe, Google Pay, Paytm, etc.

## To Use Your Actual QR Code:

1. **Save the image** you shared as `phonepe-qr.png` in the `client/images/` folder

2. The image will automatically show on the payment page

3. Customers can scan it directly to pay
