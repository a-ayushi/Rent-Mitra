import React from 'react';

const Terms = () => (
  <div className="container max-w-3xl px-4 py-12 mx-auto">
    <h1 className="mb-6 text-3xl font-bold">Terms & Conditions</h1>
    <div className="p-8 space-y-6 bg-white shadow-lg rounded-2xl">
      <p>
        Welcome to Rent Mitra! By using our platform, you agree to the following terms and conditions. Please read them carefully.
      </p>
      <h2 className="mt-4 text-xl font-semibold">1. User Responsibilities</h2>
      <ul className="ml-6 list-disc">
        <li>You must provide accurate information during registration and item listing.</li>
        <li>You are responsible for the safety and legality of items you list or rent.</li>
        <li>All transactions must comply with local laws and regulations.</li>
      </ul>
      <h2 className="mt-4 text-xl font-semibold">2. Payments & Cancellations</h2>
      <ul className="ml-6 list-disc">
        <li>Payments are processed securely through our platform.</li>
        <li>Cancellation and refund policies are outlined in the rental agreement.</li>
      </ul>
      <h2 className="mt-4 text-xl font-semibold">3. Prohibited Items</h2>
      <ul className="ml-6 list-disc">
        <li>Illegal, dangerous, or restricted items are strictly prohibited.</li>
        <li>We reserve the right to remove any listing that violates our policies.</li>
      </ul>
      <h2 className="mt-4 text-xl font-semibold">4. Liability</h2>
      <ul className="ml-6 list-disc">
        <li>Rent Mitra is not liable for damages, losses, or disputes between users.</li>
        <li>Users are encouraged to communicate clearly and document transactions.</li>
      </ul>
      <h2 className="mt-4 text-xl font-semibold">5. Changes to Terms</h2>
      <ul className="ml-6 list-disc">
        <li>We may update these terms at any time. Continued use of the platform constitutes acceptance of the new terms.</li>
      </ul>
      <p className="mt-6">For questions, contact us at <a href="mailto:support@rentmitra.com" className="text-gray-600 underline">support@rentmitra.com</a>.</p>
    </div>
  </div>
);

export default Terms;
