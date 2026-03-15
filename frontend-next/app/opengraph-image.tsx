import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const runtime = 'edge';
export const alt = 'Dr. Abhishek Atrey — Atrey Chambers of Law LLP — Advocate-on-Record, Supreme Court of India — Premier Indian Law Firm founded by Abhishek Atrey';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAMAAABlApw1AAAAilBMVEXr4sgeNyj57tTt5Mrr48np4Mbq4cjs4sns48mr4snw5s378Nb27NOSLR8OKRvz6c8kOy0XMSPq4sjk3MTc1r/V0LouQzU5TD5EVUdNXU5odGS+vKdWZFVea1x5gnKSl4Wanov/9NmKkH4HIxXNyrSCiXioqpYBHA+2tqLGw66vr5xxe2uhpJH/++Amh2a6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAgAElEQVR4nG19h3rjuNIsgwDmJFIMyjn7/V/vflUF2rPnv9rZGVuBIoBGh+rqhrfwoijGI/G8xIsXsRcnSZzEiyiJvSj2FokXRV4cJ1EcL6JFnERRksT4lIcPRV4SR17keXEULRZenHhREkXewoviyPMWUeR5UZzE+A5cZLFYLjzPSxb4O44jPLwYl4oSfm+CjyfJAt8RJV7s6fbwXZFe5BXjOIljRRIliYc79LwkwY+Jl+BWlgnHk+ACXrJYRvg5inA93RxuEh+K8LFk4fEKXrLEs0niJTG/GCPXK14cWw4yThZLb4knI9yuh3tNFjFvIsL18C7ciYcfFnjrglecX1osPTyFiUqSZYy7xtRipj3ORpx4mORFEmJyMWhMnpsErox7P9cBC7XAVfBKFGMEeAHzxdvAJTxcwsN0JXEc4SOaaPziYRj4OcE3RIm3iJIowYdjDpvLyz8Ye4wXcbUYAsCViXCNRbJYUIYi3A2viLvEhPEWYw0Ag9SA8az7ar1hEeF2KTPRYoEZTaIFV0ejxgR63mKBW4yTBRbPWyS43Qj3KkGKIgpgAuHDEBZRskiWfNHj/fH7KO0Ljllzx6/GIDx8LcSAwsB7xU1BGPEGvNHD4iS4MgfCSYJ06QeKChYWS0+55NLjIp7lbxgtpQPvg3DhhixEhMKWzE9Gv1/LPaCfIG6Wb8Pt87uiRRIvcCOxh9WMEws5iiHTWLTYw0Ag9SA8az7ar1hEeF2KTPRYoEZTaIFV0ejxgR63mKBW4yTBRbPWyS43Qj3KkGKIgpgAuHDEBZRskiWfNHj/fH7KO0Ljllzx6/GIDx8LcSAwsB7xU1BGPEGvNHD4iS4MgfCSYJ06QeKChYWS0+55NLjIp7lbxgtpQPvg3DhhixEhMKWzE9Gv1';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0E3B2F 0%, #1a5c47 50%, #0E3B2F 100%)',
          fontFamily: 'serif',
        }}
      >
        {/* Decorative border */}
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            right: 20,
            bottom: 20,
            border: '2px solid rgba(200, 170, 110, 0.4)',
            borderRadius: 8,
            display: 'flex',
          }}
        />

        {/* Corner ornaments */}
        <div
          style={{
            position: 'absolute',
            top: 30,
            left: 30,
            width: 40,
            height: 40,
            borderTop: '3px solid #C8AA6E',
            borderLeft: '3px solid #C8AA6E',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 30,
            right: 30,
            width: 40,
            height: 40,
            borderTop: '3px solid #C8AA6E',
            borderRight: '3px solid #C8AA6E',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            left: 30,
            width: 40,
            height: 40,
            borderBottom: '3px solid #C8AA6E',
            borderLeft: '3px solid #C8AA6E',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            right: 30,
            width: 40,
            height: 40,
            borderBottom: '3px solid #C8AA6E',
            borderRight: '3px solid #C8AA6E',
            display: 'flex',
          }}
        />

        {/* Scales of Justice icon */}
        <div
          style={{
            fontSize: 64,
            marginBottom: 20,
            display: 'flex',
          }}
        >
          ⚖️
        </div>

        {/* Firm name */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: '#F2EBDD',
            letterSpacing: '2px',
            textAlign: 'center',
            display: 'flex',
            marginBottom: 8,
          }}
        >
          ATREY CHAMBERS
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            color: '#C8AA6E',
            letterSpacing: '8px',
            textTransform: 'uppercase',
            display: 'flex',
            marginBottom: 32,
          }}
        >
          OF LAW LLP
        </div>

        {/* Divider */}
        <div
          style={{
            width: 120,
            height: 2,
            background: '#C8AA6E',
            marginBottom: 32,
            display: 'flex',
          }}
        />

        {/* Tagline */}
        <div
          style={{
            fontSize: 22,
            color: '#F2EBDD',
            opacity: 0.9,
            textAlign: 'center',
            display: 'flex',
            marginBottom: 8,
          }}
        >
          Premier Indian Law Firm | Supreme Court of India
        </div>
        <div
          style={{
            fontSize: 16,
            color: '#C8AA6E',
            opacity: 0.8,
            display: 'flex',
          }}
        >
          Dr. Abhishek Atrey, LL.D. • Advocate-on-Record • Since 1997
        </div>

        {/* Bottom stats */}
        <div
          style={{
            position: 'absolute',
            bottom: 50,
            display: 'flex',
            gap: 60,
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#C8AA6E', display: 'flex' }}>5000+</div>
            <div style={{ fontSize: 12, color: '#F2EBDD', opacity: 0.7, display: 'flex' }}>Cases</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#C8AA6E', display: 'flex' }}>32</div>
            <div style={{ fontSize: 12, color: '#F2EBDD', opacity: 0.7, display: 'flex' }}>Practice Areas</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#C8AA6E', display: 'flex' }}>200+</div>
            <div style={{ fontSize: 12, color: '#F2EBDD', opacity: 0.7, display: 'flex' }}>Reported Judgments</div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
