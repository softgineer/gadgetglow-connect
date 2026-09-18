# Gadget Hub Central

Build a modern, responsive e-commerce website for a gadget store.

Main Concept

The website allows customers to browse and select gadgets, add products to a cart, and submit an order with their contact and delivery information. There must be NO online payment or payment gateway on the website.

After submitting an order, the customer should be instructed to complete payment through direct communication with the store, preferably via WhatsApp or Instagram DM.

Products

Create a product catalogue for gadgets such as:

Smartphones

Smartwatches

Earbuds and headphones

Bluetooth speakers

Power banks

Chargers and cables

Laptop accessories

Gaming accessories

Computer accessories

Other consumer electronics

Each product should have:

Product image

Product name

Price in Nigerian Naira (₦)

Short description

Detailed description

Available colours/variants where applicable

Stock status

Add to Cart button

Product category

Homepage

Create a premium, modern homepage containing:

Hero section with a strong headline such as "Tech You Want. Prices You'll Love."

Featured gadgets

Popular categories

Best-selling products

Special offers

Why shop with us section

Customer testimonials

Call-to-action section

WhatsApp contact button

Footer with store information and social media links

Product Catalogue

Create a clean shop page where users can:

Browse all products

Search for products

Filter by category

Filter by price range

Sort by price

Sort by newest

Sort by popularity

View products in a responsive grid

Shopping Cart

Users should be able to:

Add products to cart

Increase/decrease quantity

Remove products

See subtotal

See total quantity

Continue shopping

Proceed to order

Persist the cart so products are not lost when the user navigates between pages.

Checkout / Order Request

Do NOT create a payment gateway or online payment section.

Instead, create an "Order Request" page.

Collect:

Full name

Phone number

WhatsApp number

Email address (optional)

Delivery address

City

State

Additional delivery instructions

Selected products

Quantities

Total order amount

Before submission, show a clear summary of the customer's order.

The main button should say:

"Place Order / Request Order"

After the customer submits the order, display a confirmation page such as:

"Order Request Received!"

"Your order has been received successfully. A member of our team will contact you shortly to confirm availability, delivery details, and payment."

Then provide a prominent:

"Continue on WhatsApp"

button that opens WhatsApp with a pre-filled message containing:

Customer name

Order number

Products ordered

Quantities

Total amount

A request to confirm the order and payment details

Payment

There should be NO card payment, Paystack, Flutterwave, Stripe, crypto payment, or other online payment integration.

Payment will be handled manually after the order request through WhatsApp/DM or another communication channel.

Make this clear without making the website look unfinished.

Order Management

Create an admin dashboard where the store owner can:

Add products

Edit products

Delete products

Upload product images

Set prices

Manage stock

Create categories

View incoming orders

View customer information

Change order status

Order statuses should include:

New Order

Contacted

Payment Pending

Payment Confirmed

Processing

Shipped

Delivered

Cancelled

The admin should be able to view each order's products, customer details, delivery address and total amount.

Design

Use a modern technology/electronics aesthetic.

Design requirements:

Premium but affordable feel

Clean layout

Strong product photography

Spacious cards

Smooth animations

Responsive on mobile, tablet and desktop

Sticky navigation

Mobile-friendly cart

Floating WhatsApp button

Clear call-to-action buttons

Fast-loading pages

Professional typography

Avoid excessive animations or visual clutter

Use a consistent design system throughout the website.

Pages

Create:

Home

Shop

Categories

Product Details

Cart

Order Request / Checkout

Order Confirmation

About Us

Contact Us

FAQ

Admin Dashboard

Important UX Flow

Customer journey:

Home → Browse Products → Product Details → Add to Cart → Cart → Enter Delivery Details → Submit Order → Order Confirmation → Contact Store via WhatsApp → Payment/Order Confirmation

Do not redirect customers to a payment gateway.

Technical Requirements

Build the application using a modern frontend framework such as React/Next.js.

Use a proper backend/database for:

Products

Categories

Inventory

Customer orders

Customer information

Order statuses

Implement form validation and error handling.

Protect the admin dashboard with authentication.

Make the website production-ready and structure the code cleanly so products, prices, categories and orders can be managed without modifying the frontend code.

Use realistic sample gadget products and images initially so the website looks complete when launched.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://gadgetglow-connect.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7a303556-d38c-4aa2-8909-918a90abf631).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
