"use client";
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const LandingPage = () => {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      backgroundColor: '#0f172a',
      color: '#ffffff',
      textAlign: 'center',
      padding: '20px'
    }}>
      <Head>
        <title>WePlay Chat | Coming Soon</title>
      </Head>
      
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>WePlay Chat</h1>
      <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '2rem' }}>
        Landing Page is under development.
      </p>
      
      <Link href="/login" style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
        padding: '12px 24px',
        borderRadius: '8px',
        color: 'white',
        textDecoration: 'none',
        fontWeight: 'bold',
        boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
      }}>
        Go to Admin Portal →
      </Link>
    </div>
  );
};

export default LandingPage;
