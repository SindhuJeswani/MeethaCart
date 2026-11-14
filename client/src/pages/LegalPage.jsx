import React from 'react';
import { Link } from 'react-router-dom';

const policies = {
  terms: {
    title: 'Terms of Service',
    intro: 'These terms explain the basic rules for using MeethaCart as a buyer or home-baker seller.',
    sections: [
      {
        title: 'Using MeethaCart',
        paragraphs: [
          'MeethaCart is a marketplace that helps buyers discover items offered by independent home bakers. By using the site, you agree to use it lawfully and provide accurate information.'
        ]
      },
      {
        title: 'Your account',
        paragraphs: [
          'Keep your sign-in details private and tell us if you believe someone has accessed your account without permission. You are responsible for activity carried out through your account.'
        ]
      },
      {
        title: 'Orders and payment',
        paragraphs: [
          'Item availability, preparation times, and fulfillment are managed by the seller. Review the item and order details before submitting an order, and provide a delivery address and contact number that can be used to coordinate delivery.',
          'The payment method available for an order is shown during checkout. MeethaCart currently supports cash on delivery.'
        ]
      },
      {
        title: 'Seller listings',
        paragraphs: [
          'Sellers are responsible for keeping their listings, prices, availability, preparation details, and product information accurate, and for fulfilling accepted orders. Sellers must only post content they are allowed to use and must follow applicable laws.'
        ]
      },
      {
        title: 'Changes, cancellations, and support',
        paragraphs: [
          'If you need to change or cancel an order, contact the seller as soon as possible. Whether a change can be made depends on the order status and applicable requirements. For help using MeethaCart, email contact@meethacart.pk.'
        ]
      },
      {
        title: 'Acceptable use and availability',
        paragraphs: [
          'Do not misuse the site, interfere with its operation, attempt unauthorized access, or use another person’s account. We may update or temporarily limit parts of the service to maintain or improve it.'
        ]
      }
    ]
  },
  privacy: {
    title: 'Privacy Policy',
    intro: 'This page describes the information MeethaCart uses to operate buyer and seller accounts and coordinate marketplace orders.',
    sections: [
      {
        title: 'Information used by MeethaCart',
        paragraphs: [
          'Depending on how you use the site, this can include your name, email address, password, account role, phone number, addresses, seller or bakery profile, item listings and images, cart contents, order details, and messages or notes you submit with an order.',
          'Passwords are hashed before they are stored. Email verification codes are used to verify an address and complete account sign-in or registration.'
        ]
      },
      {
        title: 'How information is used',
        paragraphs: [
          'We use this information to create and secure accounts, verify email addresses, display listings, maintain carts, process and track orders, coordinate fulfillment, and respond to support requests.'
        ]
      },
      {
        title: 'When information is shared',
        paragraphs: [
          'To fulfill an order, relevant order and contact details are made available to the buyer and seller involved. Information may also be handled by service providers that support site operations, such as email delivery or hosting, and may be disclosed when required by law or needed to protect users and the service.'
        ]
      },
      {
        title: 'Browser storage',
        paragraphs: [
          'MeethaCart stores your sign-in token and profile in your browser’s local storage, and may store pending verification details in session storage. If you use a shared device, sign out when you finish and close the browser session.'
        ]
      },
      {
        title: 'Retention and your choices',
        paragraphs: [
          'Information is kept as needed to operate the service, support orders, address disputes, and meet applicable requirements. You can update profile information in your account. For questions or requests about your information, contact contact@meethacart.pk.'
        ]
      },
      {
        title: 'Policy updates',
        paragraphs: [
          'We may update this policy as the service changes. The current version will be available on this page.'
        ]
      }
    ]
  }
};

const LegalPage = ({ type }) => {
  const policy = policies[type];

  return (
    <section className="page-container py-8 sm:py-12">
      <article className="mx-auto max-w-3xl">
        <header className="mb-6 sm:mb-8">
          <p className="section-eyebrow mb-2">MeethaCart policies</p>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate">
            {policy.title}
          </h1>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-bakery-700">
            {policy.intro}
          </p>
        </header>

        <div className="rounded-2xl border border-[#E5DED2] bg-white px-5 sm:px-8">
          {policy.sections.map((section, index) => (
            <section
              key={section.title}
              className={`py-5 sm:py-6 ${index < policy.sections.length - 1 ? 'border-b border-[#E5DED2]' : ''}`}
            >
              <h2 className="text-base sm:text-lg font-serif font-bold text-chocolate">
                {section.title}
              </h2>
              <div className="mt-2 space-y-3 text-sm leading-7 text-bakery-700">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <nav aria-label="Other policies" className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
          {type !== 'terms' && (
            <Link to="/terms" className="text-caramel hover:underline">
              Terms of Service
            </Link>
          )}
          {type !== 'privacy' && (
            <Link to="/privacy" className="text-caramel hover:underline">
              Privacy Policy
            </Link>
          )}
          <a href="mailto:contact@meethacart.pk" className="text-caramel hover:underline">
            Contact MeethaCart
          </a>
        </nav>
      </article>
    </section>
  );
};

export default LegalPage;
