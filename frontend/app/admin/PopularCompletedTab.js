'use client';
import React, { useState, useEffect } from 'react';
import api from '../../lib/api';

export default function PopularCompletedTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', image: '', slug: '', chapters: '' });
  
  const fetchItems = () => {
    setLoading(true);
    api.get('/admin/popular-completed')
      .then(res => setItems(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };
  
  useEffect(() => {
    fetchItems();
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/popular-completed', form);
      if (res.status === 200) {
        setForm({ title: '', image: '', slug: '', chapters: '' });
        fetchItems();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to add item');
    }
  };
  
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const res = await api.delete(`/admin/popular-completed/${id}`);
      if (res.status === 200) {
        fetchItems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent)', marginBottom: 20 }}>Popular Completed Manga</h2>
      
      <div style={{ background: '#fff', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 24 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Add New Entry</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 4 }}>Title</label>
            <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 4 }}>Image URL</label>
            <input required type="text" value={form.image} onChange={e => setForm({...form, image: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 4 }}>Slug (e.g. mangadex:123 or title-slug)</label>
            <input required type="text" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 4 }}>Chapters (e.g. 'Chapter 100')</label>
            <input type="text" value={form.chapters} onChange={e => setForm({...form, chapters: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8 }} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" style={{ padding: '10px 24px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Add Entry</button>
          </div>
        </form>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Image</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Title</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Slug</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="4" style={{ padding: 24, textAlign: 'center' }}>Loading...</td></tr> : 
              items.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}><img src={item.image} style={{ width: 40, height: 56, objectFit: 'cover', borderRadius: 4 }} alt="" /></td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{item.title}</td>
                  <td style={{ padding: '12px 16px' }}>{item.slug}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button onClick={() => handleDelete(item.id)} style={{ padding: '6px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                  </td>
                </tr>
              ))
            }
            {!loading && items.length === 0 && <tr><td colSpan="4" style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No entries found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
