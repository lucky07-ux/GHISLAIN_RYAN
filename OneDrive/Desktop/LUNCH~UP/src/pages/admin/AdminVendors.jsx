import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editVendor, setEditVendor] = useState(null);
  const [duration, setDuration] = useState(1);
  const [plan, setPlan] = useState('basic');

  useEffect(() => {
    fetchVendors();
  }, []);

  async function fetchVendors() {
    setLoading(true);
    const { data } = await supabase.from('vendors').select('*');
    setVendors(data || []);
    setLoading(false);
  }

  async function handleUpgrade(vendor) {
    const start = new Date();
    const end = addMonths(start, duration);
    await supabase.from('vendors').update({
      subscription_plan: plan,
      subscription_start: start.toISOString(),
      subscription_end: end.toISOString(),
      status: 'active',
    }).eq('id', vendor.id);
    setEditVendor(null);
    fetchVendors();
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Vendors</h2>
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th>Business Name</th>
            <th>Owner Name</th>
            <th>Email</th>
            <th>Plan</th>
            <th>Status</th>
            <th>Subscription End</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="7">Loading...</td></tr>
          ) : vendors.length === 0 ? (
            <tr><td colSpan="7">No vendors found.</td></tr>
          ) : (
            vendors.map(v => (
              <tr key={v.id}>
                <td>{v.business_name}</td>
                <td>{v.owner_name}</td>
                <td>{v.email}</td>
                <td>{v.subscription_plan}</td>
                <td>{v.status}</td>
                <td>{v.subscription_end ? new Date(v.subscription_end).toLocaleDateString() : '-'}</td>
                <td>
                  <button className="text-blue-600 mr-2" onClick={() => setEditVendor(v)}>Upgrade</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {editVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-xl mb-4">Upgrade Vendor</h3>
            <select className="border p-2 mb-2 w-full" value={plan} onChange={e => setPlan(e.target.value)}>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
            </select>
            <select className="border p-2 mb-2 w-full" value={duration} onChange={e => setDuration(Number(e.target.value))}>
              <option value={1}>1 Month</option>
              <option value={3}>3 Months</option>
              <option value={12}>1 Year</option>
            </select>
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => handleUpgrade(editVendor)}>Save</button>
            <button className="ml-2 px-4 py-2" onClick={() => setEditVendor(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
