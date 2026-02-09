import { useState, useEffect, useRef, useCallback } from 'react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import { getCampaigns, sendCampaign, sendTestEmail } from '../../services/marketing.service';
import { getSettingsByGroup } from '../../services/settings.service';
import { getCoupons } from '../../services/coupons.service';
import styles from './Marketing.module.css';

const HOLIDAY_TEMPLATES = [
  {
    id: 'diwali',
    name: 'Diwali',
    emoji: '\u{1FA94}',
    description: 'Festival of lights celebration',
    subject: '\u{1FA94} Happy Diwali from {{companyName}}! Light Up Your Celebrations on the Water',
    body: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#FFF8E1;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background-color:#ffffff;">
<tr><td style="background:linear-gradient(135deg,#FF6F00,#FFB300,#FF6F00);padding:40px 30px;text-align:center;">
<div style="font-size:48px;margin-bottom:10px;">\u{1FA94}\u2728\u{1FA94}</div>
<h1 style="color:#ffffff;margin:0;font-size:28px;text-shadow:1px 1px 2px rgba(0,0,0,0.3);">Happy Diwali!</h1>
<p style="color:#FFF8E1;margin:8px 0 0;font-size:16px;">May the festival of lights brighten your life</p>
</td></tr>
<tr><td style="padding:30px;">
<p style="color:#333333;font-size:16px;line-height:1.6;margin:0 0 20px;">Dear Valued Customer,</p>
<p style="color:#333333;font-size:16px;line-height:1.6;margin:0 0 20px;">This Diwali, celebrate the festival of lights with an unforgettable experience on the water! Let the shimmering waves reflect the joy of the season.</p>
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="background-color:#FFF3E0;border-left:4px solid #FF6F00;padding:20px;border-radius:4px;">
<h2 style="color:#E65100;margin:0 0 8px;font-size:20px;">\u{1F389} Diwali Special Offer!</h2>
<p style="color:#333333;font-size:16px;margin:0;">Get <strong>X% off</strong> on all boat rides! Use code: <strong>DIWALIXX</strong></p>
</td></tr></table>
<div style="text-align:center;margin:30px 0;">
<a href="#" style="display:inline-block;background-color:#FF6F00;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:bold;">Book Your Diwali Ride \u2192</a>
</div>
<p style="color:#666666;font-size:14px;line-height:1.6;margin:0;">Wishing you and your family a prosperous and joyous Diwali!</p>
</td></tr>
<tr><td style="background-color:#F5F5F5;padding:20px 30px;text-align:center;border-top:1px solid #E0E0E0;">
<p style="color:#999999;font-size:12px;margin:0;">{{companyName}} | Making memories on the water</p>
</td></tr>
</table></body></html>`
  },
  {
    id: 'christmas',
    name: 'Christmas',
    emoji: '\u{1F384}',
    description: 'Merry Christmas holiday greetings',
    subject: '\u{1F384} Merry Christmas from {{companyName}}! Sail Into the Holiday Spirit',
    body: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#F1F8E9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background-color:#ffffff;">
<tr><td style="background:linear-gradient(135deg,#C62828,#2E7D32,#C62828);padding:40px 30px;text-align:center;">
<div style="font-size:48px;margin-bottom:10px;">\u{1F384}\u{1F385}\u{1F384}</div>
<h1 style="color:#ffffff;margin:0;font-size:28px;text-shadow:1px 1px 2px rgba(0,0,0,0.3);">Merry Christmas!</h1>
<p style="color:#E8F5E9;margin:8px 0 0;font-size:16px;">Wishing you joy, peace, and wonderful celebrations</p>
</td></tr>
<tr><td style="padding:30px;">
<p style="color:#333333;font-size:16px;line-height:1.6;margin:0 0 20px;">Dear Valued Customer,</p>
<p style="color:#333333;font-size:16px;line-height:1.6;margin:0 0 20px;">This Christmas, give your loved ones the gift of an extraordinary experience! Set sail with us and create magical memories under the winter sky.</p>
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="background-color:#FFEBEE;border-left:4px solid #C62828;padding:20px;border-radius:4px;">
<h2 style="color:#B71C1C;margin:0 0 8px;font-size:20px;">\u{1F381} Christmas Special Offer!</h2>
<p style="color:#333333;font-size:16px;margin:0;">Get <strong>X% off</strong> on all boat rides! Use code: <strong>XMASXX</strong></p>
</td></tr></table>
<div style="text-align:center;margin:30px 0;">
<a href="#" style="display:inline-block;background-color:#C62828;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:bold;">Book Your Christmas Ride \u2192</a>
</div>
<p style="color:#666666;font-size:14px;line-height:1.6;margin:0;">Merry Christmas and Happy Holidays from our family to yours!</p>
</td></tr>
<tr><td style="background-color:#F5F5F5;padding:20px 30px;text-align:center;border-top:1px solid #E0E0E0;">
<p style="color:#999999;font-size:12px;margin:0;">{{companyName}} | Making memories on the water</p>
</td></tr>
</table></body></html>`
  },
  {
    id: 'new-year',
    name: 'New Year',
    emoji: '\u{1F386}',
    description: 'Ring in the New Year with style',
    subject: '\u{1F386} Happy New Year from {{companyName}}! Start the Year with an Adventure',
    body: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#E8EAF6;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background-color:#ffffff;">
<tr><td style="background:linear-gradient(135deg,#1A237E,#4A148C,#1A237E);padding:40px 30px;text-align:center;">
<div style="font-size:48px;margin-bottom:10px;">\u{1F386}\u{1F37E}\u{1F386}</div>
<h1 style="color:#ffffff;margin:0;font-size:28px;text-shadow:1px 1px 2px rgba(0,0,0,0.3);">Happy New Year!</h1>
<p style="color:#C5CAE9;margin:8px 0 0;font-size:16px;">Cheers to new beginnings and exciting adventures</p>
</td></tr>
<tr><td style="padding:30px;">
<p style="color:#333333;font-size:16px;line-height:1.6;margin:0 0 20px;">Dear Valued Customer,</p>
<p style="color:#333333;font-size:16px;line-height:1.6;margin:0 0 20px;">Kick off the New Year with an unforgettable boat ride! Whether you are celebrating with friends, family, or that special someone, start the year with memories you will cherish forever.</p>
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="background-color:#EDE7F6;border-left:4px solid #4A148C;padding:20px;border-radius:4px;">
<h2 style="color:#4A148C;margin:0 0 8px;font-size:20px;">\u{1F37E} New Year Special Offer!</h2>
<p style="color:#333333;font-size:16px;margin:0;">Get <strong>X% off</strong> on all boat rides! Use code: <strong>NEWYEARXX</strong></p>
</td></tr></table>
<div style="text-align:center;margin:30px 0;">
<a href="#" style="display:inline-block;background-color:#4A148C;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:bold;">Book Your New Year Ride \u2192</a>
</div>
<p style="color:#666666;font-size:14px;line-height:1.6;margin:0;">Here is to an amazing year ahead filled with adventure!</p>
</td></tr>
<tr><td style="background-color:#F5F5F5;padding:20px 30px;text-align:center;border-top:1px solid #E0E0E0;">
<p style="color:#999999;font-size:12px;margin:0;">{{companyName}} | Making memories on the water</p>
</td></tr>
</table></body></html>`
  },
  {
    id: 'holi',
    name: 'Holi',
    emoji: '\u{1F3A8}',
    description: 'Festival of colors celebration',
    subject: '\u{1F3A8} Happy Holi from {{companyName}}! Add Colors to Your Celebration on Water',
    body: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#FCE4EC;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background-color:#ffffff;">
<tr><td style="background:linear-gradient(135deg,#E91E63,#FF9800,#4CAF50,#2196F3);padding:40px 30px;text-align:center;">
<div style="font-size:48px;margin-bottom:10px;">\u{1F3A8}\u{1F308}\u{1F3A8}</div>
<h1 style="color:#ffffff;margin:0;font-size:28px;text-shadow:1px 1px 2px rgba(0,0,0,0.3);">Happy Holi!</h1>
<p style="color:#ffffff;margin:8px 0 0;font-size:16px;">Let the colors of joy splash into your life</p>
</td></tr>
<tr><td style="padding:30px;">
<p style="color:#333333;font-size:16px;line-height:1.6;margin:0 0 20px;">Dear Valued Customer,</p>
<p style="color:#333333;font-size:16px;line-height:1.6;margin:0 0 20px;">This Holi, make your celebration truly special! Enjoy a vibrant boat ride with friends and family as you paint the town (and the waves) with colors of happiness.</p>
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="background-color:#F3E5F5;border-left:4px solid #9C27B0;padding:20px;border-radius:4px;">
<h2 style="color:#7B1FA2;margin:0 0 8px;font-size:20px;">\u{1F308} Holi Special Offer!</h2>
<p style="color:#333333;font-size:16px;margin:0;">Get <strong>X% off</strong> on all boat rides! Use code: <strong>HOLIXX</strong></p>
</td></tr></table>
<div style="text-align:center;margin:30px 0;">
<a href="#" style="display:inline-block;background:linear-gradient(135deg,#E91E63,#FF9800);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:bold;">Book Your Holi Ride \u2192</a>
</div>
<p style="color:#666666;font-size:14px;line-height:1.6;margin:0;">Wishing you a colorful and joyous Holi!</p>
</td></tr>
<tr><td style="background-color:#F5F5F5;padding:20px 30px;text-align:center;border-top:1px solid #E0E0E0;">
<p style="color:#999999;font-size:12px;margin:0;">{{companyName}} | Making memories on the water</p>
</td></tr>
</table></body></html>`
  },
  {
    id: 'valentines',
    name: "Valentine's Day",
    emoji: '\u2764\uFE0F',
    description: 'Romantic getaway on the water',
    subject: "\u2764\uFE0F Valentine's Special from {{companyName}}! Romance on the Waves",
    body: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#FCE4EC;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background-color:#ffffff;">
<tr><td style="background:linear-gradient(135deg,#C2185B,#E91E63,#F06292);padding:40px 30px;text-align:center;">
<div style="font-size:48px;margin-bottom:10px;">\u2764\uFE0F\u{1F6A2}\u2764\uFE0F</div>
<h1 style="color:#ffffff;margin:0;font-size:28px;text-shadow:1px 1px 2px rgba(0,0,0,0.3);">Happy Valentine's Day!</h1>
<p style="color:#F8BBD0;margin:8px 0 0;font-size:16px;">Create unforgettable moments with your special someone</p>
</td></tr>
<tr><td style="padding:30px;">
<p style="color:#333333;font-size:16px;line-height:1.6;margin:0 0 20px;">Dear Valued Customer,</p>
<p style="color:#333333;font-size:16px;line-height:1.6;margin:0 0 20px;">This Valentine's Day, sweep your special someone off their feet with a romantic boat ride! Watch the sunset, feel the breeze, and create memories that will last a lifetime.</p>
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="background-color:#FCE4EC;border-left:4px solid #C2185B;padding:20px;border-radius:4px;">
<h2 style="color:#880E4F;margin:0 0 8px;font-size:20px;">\u{1F48C} Valentine's Special Offer!</h2>
<p style="color:#333333;font-size:16px;margin:0;">Get <strong>X% off</strong> on couple boat rides! Use code: <strong>LOVEXX</strong></p>
</td></tr></table>
<div style="text-align:center;margin:30px 0;">
<a href="#" style="display:inline-block;background-color:#C2185B;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:bold;">Book a Romantic Ride \u2192</a>
</div>
<p style="color:#666666;font-size:14px;line-height:1.6;margin:0;">Love is in the air... and on the water!</p>
</td></tr>
<tr><td style="background-color:#F5F5F5;padding:20px 30px;text-align:center;border-top:1px solid #E0E0E0;">
<p style="color:#999999;font-size:12px;margin:0;">{{companyName}} | Making memories on the water</p>
</td></tr>
</table></body></html>`
  },
  {
    id: 'independence-day',
    name: 'Independence Day',
    emoji: '\u{1F1EE}\u{1F1F3}',
    description: '15th August patriotic celebration',
    subject: '\u{1F1EE}\u{1F1F3} Happy Independence Day from {{companyName}}! Celebrate Freedom on the Waves',
    body: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#FFF3E0;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background-color:#ffffff;">
<tr><td style="background:linear-gradient(180deg,#FF9933 33%,#FFFFFF 33%,#FFFFFF 66%,#138808 66%);padding:40px 30px;text-align:center;">
<div style="font-size:48px;margin-bottom:10px;">\u{1F1EE}\u{1F1F3}\u{1F3B5}\u{1F1EE}\u{1F1F3}</div>
<h1 style="color:#1A237E;margin:0;font-size:28px;text-shadow:1px 1px 2px rgba(255,255,255,0.5);">Happy Independence Day!</h1>
<p style="color:#333333;margin:8px 0 0;font-size:16px;background:rgba(255,255,255,0.7);display:inline-block;padding:4px 12px;border-radius:4px;">Jai Hind! Celebrate the spirit of freedom</p>
</td></tr>
<tr><td style="padding:30px;">
<p style="color:#333333;font-size:16px;line-height:1.6;margin:0 0 20px;">Dear Valued Customer,</p>
<p style="color:#333333;font-size:16px;line-height:1.6;margin:0 0 20px;">This Independence Day, celebrate the spirit of freedom with an exhilarating boat ride! Feel the wind of liberty as you cruise the open waters with your loved ones.</p>
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="background-color:#E8F5E9;border-left:4px solid #138808;padding:20px;border-radius:4px;">
<h2 style="color:#1B5E20;margin:0 0 8px;font-size:20px;">\u{1F1EE}\u{1F1F3} Independence Day Offer!</h2>
<p style="color:#333333;font-size:16px;margin:0;">Get <strong>X% off</strong> on all boat rides! Use code: <strong>FREEDOMXX</strong></p>
</td></tr></table>
<div style="text-align:center;margin:30px 0;">
<a href="#" style="display:inline-block;background-color:#138808;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:bold;">Book Your Freedom Ride \u2192</a>
</div>
<p style="color:#666666;font-size:14px;line-height:1.6;margin:0;">Vande Mataram! Have a wonderful Independence Day!</p>
</td></tr>
<tr><td style="background-color:#F5F5F5;padding:20px 30px;text-align:center;border-top:1px solid #E0E0E0;">
<p style="color:#999999;font-size:12px;margin:0;">{{companyName}} | Making memories on the water</p>
</td></tr>
</table></body></html>`
  },
  {
    id: 'eid',
    name: 'Eid',
    emoji: '\u{1F319}',
    description: 'Eid Mubarak celebration wishes',
    subject: '\u{1F319} Eid Mubarak from {{companyName}}! Celebrate with a Special Boat Ride',
    body: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#E8F5E9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background-color:#ffffff;">
<tr><td style="background:linear-gradient(135deg,#00695C,#004D40,#00695C);padding:40px 30px;text-align:center;">
<div style="font-size:48px;margin-bottom:10px;">\u{1F319}\u2B50\u{1F319}</div>
<h1 style="color:#ffffff;margin:0;font-size:28px;text-shadow:1px 1px 2px rgba(0,0,0,0.3);">Eid Mubarak!</h1>
<p style="color:#A5D6A7;margin:8px 0 0;font-size:16px;">Wishing you blessings, peace, and happiness</p>
</td></tr>
<tr><td style="padding:30px;">
<p style="color:#333333;font-size:16px;line-height:1.6;margin:0 0 20px;">Dear Valued Customer,</p>
<p style="color:#333333;font-size:16px;line-height:1.6;margin:0 0 20px;">This Eid, celebrate with your family and friends on a delightful boat ride! Let the calm waters and gentle breeze add to the joy of this blessed occasion.</p>
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="background-color:#E0F2F1;border-left:4px solid #00695C;padding:20px;border-radius:4px;">
<h2 style="color:#004D40;margin:0 0 8px;font-size:20px;">\u2B50 Eid Special Offer!</h2>
<p style="color:#333333;font-size:16px;margin:0;">Get <strong>X% off</strong> on all boat rides! Use code: <strong>EIDXX</strong></p>
</td></tr></table>
<div style="text-align:center;margin:30px 0;">
<a href="#" style="display:inline-block;background-color:#00695C;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:bold;">Book Your Eid Ride \u2192</a>
</div>
<p style="color:#666666;font-size:14px;line-height:1.6;margin:0;">Eid Mubarak to you and your loved ones!</p>
</td></tr>
<tr><td style="background-color:#F5F5F5;padding:20px 30px;text-align:center;border-top:1px solid #E0E0E0;">
<p style="color:#999999;font-size:12px;margin:0;">{{companyName}} | Making memories on the water</p>
</td></tr>
</table></body></html>`
  },
  {
    id: 'ganesh-chaturthi',
    name: 'Ganesh Chaturthi',
    emoji: '\u{1F418}',
    description: 'Ganpati Bappa Morya celebration',
    subject: '\u{1F418} Ganesh Chaturthi Wishes from {{companyName}}! Celebrate with Bappa on the Water',
    body: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#FFF8E1;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background-color:#ffffff;">
<tr><td style="background:linear-gradient(135deg,#E65100,#FF8F00,#E65100);padding:40px 30px;text-align:center;">
<div style="font-size:48px;margin-bottom:10px;">\u{1F418}\u{1F4AE}\u{1F418}</div>
<h1 style="color:#ffffff;margin:0;font-size:28px;text-shadow:1px 1px 2px rgba(0,0,0,0.3);">Ganpati Bappa Morya!</h1>
<p style="color:#FFE0B2;margin:8px 0 0;font-size:16px;">May Lord Ganesha bless you with wisdom and prosperity</p>
</td></tr>
<tr><td style="padding:30px;">
<p style="color:#333333;font-size:16px;line-height:1.6;margin:0 0 20px;">Dear Valued Customer,</p>
<p style="color:#333333;font-size:16px;line-height:1.6;margin:0 0 20px;">This Ganesh Chaturthi, celebrate the arrival of Lord Ganesha with a joyous boat ride! Bring your family along for a memorable experience on the waters as the festivities come alive.</p>
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="background-color:#FFF3E0;border-left:4px solid #E65100;padding:20px;border-radius:4px;">
<h2 style="color:#BF360C;margin:0 0 8px;font-size:20px;">\u{1F4AE} Ganesh Chaturthi Offer!</h2>
<p style="color:#333333;font-size:16px;margin:0;">Get <strong>X% off</strong> on all boat rides! Use code: <strong>GANPATIXX</strong></p>
</td></tr></table>
<div style="text-align:center;margin:30px 0;">
<a href="#" style="display:inline-block;background-color:#E65100;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:bold;">Book Your Festive Ride \u2192</a>
</div>
<p style="color:#666666;font-size:14px;line-height:1.6;margin:0;">Ganpati Bappa Morya! Mangal Murti Morya!</p>
</td></tr>
<tr><td style="background-color:#F5F5F5;padding:20px 30px;text-align:center;border-top:1px solid #E0E0E0;">
<p style="color:#999999;font-size:12px;margin:0;">{{companyName}} | Making memories on the water</p>
</td></tr>
</table></body></html>`
  },
  {
    id: 'navratri',
    name: 'Navratri',
    emoji: '\u{1F483}',
    description: 'Nine nights of dance and devotion',
    subject: '\u{1F483} Happy Navratri from {{companyName}}! Dance Your Way to the Waves',
    body: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#F3E5F5;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background-color:#ffffff;">
<tr><td style="background:linear-gradient(135deg,#AD1457,#D81B60,#F06292);padding:40px 30px;text-align:center;">
<div style="font-size:48px;margin-bottom:10px;">\u{1F483}\u{1F52E}\u{1F483}</div>
<h1 style="color:#ffffff;margin:0;font-size:28px;text-shadow:1px 1px 2px rgba(0,0,0,0.3);">Happy Navratri!</h1>
<p style="color:#F8BBD0;margin:8px 0 0;font-size:16px;">Nine nights of celebration, devotion, and joy</p>
</td></tr>
<tr><td style="padding:30px;">
<p style="color:#333333;font-size:16px;line-height:1.6;margin:0 0 20px;">Dear Valued Customer,</p>
<p style="color:#333333;font-size:16px;line-height:1.6;margin:0 0 20px;">This Navratri, take the celebration to the water! After nights of Garba and Dandiya, treat yourself and your loved ones to a refreshing boat ride and create beautiful memories.</p>
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="background-color:#FCE4EC;border-left:4px solid #AD1457;padding:20px;border-radius:4px;">
<h2 style="color:#880E4F;margin:0 0 8px;font-size:20px;">\u{1F52E} Navratri Special Offer!</h2>
<p style="color:#333333;font-size:16px;margin:0;">Get <strong>X% off</strong> on all boat rides! Use code: <strong>NAVRATRIXX</strong></p>
</td></tr></table>
<div style="text-align:center;margin:30px 0;">
<a href="#" style="display:inline-block;background-color:#AD1457;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:bold;">Book Your Navratri Ride \u2192</a>
</div>
<p style="color:#666666;font-size:14px;line-height:1.6;margin:0;">May Maa Durga bless you with strength and happiness!</p>
</td></tr>
<tr><td style="background-color:#F5F5F5;padding:20px 30px;text-align:center;border-top:1px solid #E0E0E0;">
<p style="color:#999999;font-size:12px;margin:0;">{{companyName}} | Making memories on the water</p>
</td></tr>
</table></body></html>`
  },
  {
    id: 'raksha-bandhan',
    name: 'Raksha Bandhan',
    emoji: '\u{1F380}',
    description: 'Celebrate the bond of siblings',
    subject: '\u{1F380} Happy Raksha Bandhan from {{companyName}}! Gift Your Sibling a Boat Ride',
    body: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#E3F2FD;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background-color:#ffffff;">
<tr><td style="background:linear-gradient(135deg,#1565C0,#42A5F5,#1565C0);padding:40px 30px;text-align:center;">
<div style="font-size:48px;margin-bottom:10px;">\u{1F380}\u{1F495}\u{1F380}</div>
<h1 style="color:#ffffff;margin:0;font-size:28px;text-shadow:1px 1px 2px rgba(0,0,0,0.3);">Happy Raksha Bandhan!</h1>
<p style="color:#BBDEFB;margin:8px 0 0;font-size:16px;">Celebrating the beautiful bond between siblings</p>
</td></tr>
<tr><td style="padding:30px;">
<p style="color:#333333;font-size:16px;line-height:1.6;margin:0 0 20px;">Dear Valued Customer,</p>
<p style="color:#333333;font-size:16px;line-height:1.6;margin:0 0 20px;">This Raksha Bandhan, go beyond the usual gifts! Surprise your sibling with an exciting boat ride experience. Create unforgettable memories together on the water.</p>
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="background-color:#E3F2FD;border-left:4px solid #1565C0;padding:20px;border-radius:4px;">
<h2 style="color:#0D47A1;margin:0 0 8px;font-size:20px;">\u{1F495} Rakhi Special Offer!</h2>
<p style="color:#333333;font-size:16px;margin:0;">Get <strong>X% off</strong> on sibling duo rides! Use code: <strong>RAKHIXX</strong></p>
</td></tr></table>
<div style="text-align:center;margin:30px 0;">
<a href="#" style="display:inline-block;background-color:#1565C0;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:bold;">Book a Sibling Ride \u2192</a>
</div>
<p style="color:#666666;font-size:14px;line-height:1.6;margin:0;">Celebrate the bond that makes life beautiful!</p>
</td></tr>
<tr><td style="background-color:#F5F5F5;padding:20px 30px;text-align:center;border-top:1px solid #E0E0E0;">
<p style="color:#999999;font-size:12px;margin:0;">{{companyName}} | Making memories on the water</p>
</td></tr>
</table></body></html>`
  }
];

// Map template IDs to their default coupon code placeholders
const TEMPLATE_COUPON_PLACEHOLDERS = {
  diwali: 'DIWALIXX',
  christmas: 'XMASXX',
  'new-year': 'NEWYEARXX',
  holi: 'HOLIXX',
  valentines: 'LOVEXX',
  'independence-day': 'FREEDOMXX',
  eid: 'EIDXX',
  'ganesh-chaturthi': 'GANPATIXX',
  navratri: 'NAVRATRIXX',
  'raksha-bandhan': 'RAKHIXX',
};

const Marketing = () => {
  const { showSuccess, showError } = useUIStore();
  const { user } = useAuthStore();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Compose form state
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  // Template variables
  const [companyName, setCompanyName] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState('');

  // Data for template variables
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [defaultCompanyName, setDefaultCompanyName] = useState('');

  // Track which template is loaded (for coupon placeholder matching)
  const [activeTemplateId, setActiveTemplateId] = useState(null);

  // Raw template body (before variable substitution) for re-applying variables
  const [rawBody, setRawBody] = useState('');
  const [rawSubject, setRawSubject] = useState('');

  // Preview iframe ref
  const previewIframeRef = useRef(null);

  // Auto-fill test email with logged-in admin's email
  useEffect(() => {
    if (user?.email && !testEmail) {
      setTestEmail(user.email);
    }
  }, [user]);

  // Fetch campaigns
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await getCampaigns();
      if (response.success) {
        setCampaigns(response.data || []);
      }
    } catch (err) {
      showError(err.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  // Fetch general settings for company name
  const fetchCompanyName = async () => {
    try {
      const response = await getSettingsByGroup('general');
      if (response.success && response.data) {
        // Settings are stored as { group, key, value } - general group usually has key='config'
        const settings = response.data;
        // Could be array or single object
        const config = Array.isArray(settings)
          ? settings.find(s => s.key === 'config')?.value
          : settings.value || settings;
        const name = config?.companyName || config?.company_name || config?.name || '';
        if (name) {
          setDefaultCompanyName(name);
          setCompanyName(name);
        }
      }
    } catch {
      // Silently fail - company name is optional
    }
  };

  // Fetch coupons for dropdown
  const fetchCoupons = async () => {
    try {
      setLoadingCoupons(true);
      const response = await getCoupons({ limit: 100 });
      if (response.success) {
        const couponList = response.data?.docs || response.data || [];
        setCoupons(Array.isArray(couponList) ? couponList : []);
      }
    } catch {
      // Silently fail - coupons are optional
    } finally {
      setLoadingCoupons(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchCompanyName();
    fetchCoupons();
  }, []);

  // Apply template variables to raw body and subject
  const applyVariables = useCallback((rawBodyText, rawSubjectText, compName, discount, coupon, templateId) => {
    let processedBody = rawBodyText;
    let processedSubject = rawSubjectText;

    // Replace {{companyName}}
    if (compName) {
      processedBody = processedBody.replace(/\{\{companyName\}\}/g, compName);
      processedSubject = processedSubject.replace(/\{\{companyName\}\}/g, compName);
    }

    // Replace X% with discount percentage
    if (discount) {
      processedBody = processedBody.replace(/X%/g, `${discount}%`);
      processedSubject = processedSubject.replace(/X%/g, `${discount}%`);
    }

    // Replace coupon code placeholder with selected coupon
    if (coupon && templateId && TEMPLATE_COUPON_PLACEHOLDERS[templateId]) {
      const placeholder = TEMPLATE_COUPON_PLACEHOLDERS[templateId];
      processedBody = processedBody.replace(new RegExp(placeholder, 'g'), coupon);
      processedSubject = processedSubject.replace(new RegExp(placeholder, 'g'), coupon);
    }

    return { processedBody, processedSubject };
  }, []);

  // When template variables change, re-apply them to the raw body/subject
  useEffect(() => {
    if (!rawBody && !rawSubject) return;

    const { processedBody, processedSubject } = applyVariables(
      rawBody, rawSubject, companyName, discountPercent, selectedCoupon, activeTemplateId
    );
    setBody(processedBody);
    setSubject(processedSubject);
  }, [companyName, discountPercent, selectedCoupon, rawBody, rawSubject, activeTemplateId, applyVariables]);

  // Update iframe preview when body changes
  useEffect(() => {
    if (previewIframeRef.current && body.trim()) {
      const iframe = previewIframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(body);
        doc.close();
      }
    }
  }, [body]);

  const handleUseTemplate = (template) => {
    setRawSubject(template.subject);
    setRawBody(template.body);
    setActiveTemplateId(template.id);

    // Apply current variable values immediately
    const { processedBody, processedSubject } = applyVariables(
      template.body, template.subject, companyName, discountPercent, selectedCoupon, template.id
    );
    setSubject(processedSubject);
    setBody(processedBody);
    setShowCompose(true);
  };

  const handleOpenCompose = () => {
    // Open blank compose
    setSubject('');
    setBody('');
    setRawSubject('');
    setRawBody('');
    setActiveTemplateId(null);
    setShowCompose(true);
  };

  const handleCloseCompose = () => {
    setShowCompose(false);
    setSubject('');
    setBody('');
    setRawSubject('');
    setRawBody('');
    setActiveTemplateId(null);
    setDiscountPercent('');
    setSelectedCoupon('');
    // Reset test email to admin's email
    if (user?.email) {
      setTestEmail(user.email);
    }
  };

  const handleBodyChange = (e) => {
    const newBody = e.target.value;
    setBody(newBody);
    // When manually editing, update the raw body too so variable replacement continues to work
    setRawBody(newBody);
  };

  const handleSubjectChange = (e) => {
    const newSubject = e.target.value;
    setSubject(newSubject);
    setRawSubject(newSubject);
  };

  const handleSendTest = async () => {
    if (!subject.trim() || !body.trim()) {
      showError('Please fill in subject and body');
      return;
    }
    if (!testEmail.trim()) {
      showError('Please enter a test email address');
      return;
    }
    try {
      setSendingTest(true);
      await sendTestEmail({ subject, body, testEmail });
      showSuccess(`Test email sent to ${testEmail}`);
    } catch (err) {
      showError(err.message || 'Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  const handleSendToAll = async () => {
    if (!subject.trim() || !body.trim()) {
      showError('Please fill in subject and body');
      return;
    }
    try {
      setSending(true);
      const response = await sendCampaign({ subject, body });
      showSuccess(`Email sent to ${response.data?.recipientCount || 0} customers`);
      setShowConfirm(false);
      handleCloseCompose();
      fetchCampaigns();
    } catch (err) {
      showError(err.message || 'Failed to send campaign');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // Build coupon options for the Select component
  const couponOptions = coupons
    .filter(c => c.isActive !== false)
    .map(c => ({
      value: c.code,
      label: `${c.code}${c.discountType === 'PERCENTAGE' ? ` (${c.discountValue}% off)` : c.discountType === 'FIXED' ? ` (Flat Rs.${c.discountValue} off)` : ''}`,
    }));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Marketing</h1>
        {!showCompose && (
          <Button onClick={handleOpenCompose}>
            Compose Email
          </Button>
        )}
        {showCompose && (
          <Button variant="ghost" onClick={handleCloseCompose}>
            Close Compose
          </Button>
        )}
      </div>

      {/* Compose Section - Full page split layout */}
      {showCompose && (
        <div className={styles.composeSection}>
          <div className={styles.composeSplit}>
            {/* LEFT SIDE: Compose Form */}
            <div className={styles.composeLeft}>
              <h2 className={styles.composeSectionTitle}>Compose Email</h2>

              <Input
                label="Subject"
                placeholder="Enter email subject..."
                value={subject}
                onChange={handleSubjectChange}
                required
              />

              {/* Template Variables */}
              <div className={styles.variablesSection}>
                <h3 className={styles.variablesTitle}>Template Variables</h3>
                <p className={styles.variablesHint}>
                  These values will be auto-replaced in the email body and subject.
                </p>
                <div className={styles.variablesGrid}>
                  <Input
                    label="Company Name"
                    placeholder="Enter company name..."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    hint="Replaces {{companyName}} in template"
                  />
                  <Input
                    label="Discount Percentage"
                    type="number"
                    placeholder="e.g. 20"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    hint="Replaces X% in template"
                    min="0"
                    max="100"
                  />
                  <Select
                    label="Coupon Code"
                    options={couponOptions}
                    value={selectedCoupon}
                    onChange={(val) => setSelectedCoupon(val)}
                    placeholder={loadingCoupons ? 'Loading coupons...' : 'Select a coupon code'}
                    disabled={loadingCoupons}
                    searchable
                    hint="Replaces coupon placeholder in template"
                  />
                </div>
              </div>

              <Textarea
                label="Email Body (HTML supported)"
                placeholder="Write your email content here... HTML tags are supported for formatting."
                value={body}
                onChange={handleBodyChange}
                rows={14}
                required
              />

              {/* Test Email */}
              <div className={styles.testSection}>
                <Input
                  label="Test Email Address"
                  placeholder="Enter email to send a test..."
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
                <Button variant="outline" onClick={handleSendTest} loading={sendingTest} size="sm">
                  Send Test
                </Button>
              </div>

              {/* Actions */}
              <div className={styles.composeActions}>
                <Button variant="ghost" onClick={handleCloseCompose}>
                  Cancel
                </Button>
                <Button onClick={() => setShowConfirm(true)} disabled={!subject.trim() || !body.trim()}>
                  Send to All Customers
                </Button>
              </div>
            </div>

            {/* RIGHT SIDE: Live Preview */}
            <div className={styles.composeRight}>
              <h2 className={styles.composeSectionTitle}>Live Preview</h2>
              <div className={styles.previewContainer}>
                {body.trim() ? (
                  <iframe
                    ref={previewIframeRef}
                    className={styles.previewIframe}
                    title="Email Preview"
                    sandbox="allow-same-origin"
                  />
                ) : (
                  <div className={styles.previewEmpty}>
                    <p>Email preview will appear here</p>
                    <p className={styles.previewEmptyHint}>
                      Select a template or start typing in the body to see a live preview
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Holiday/Festival Templates */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Holiday Campaign Templates</h2>
        <p className={styles.templateSectionDesc}>
          Choose a pre-built festive email template to get started quickly. Click "Use Template" to open the compose form with the template pre-filled.
        </p>
        <div className={styles.templateGrid}>
          {HOLIDAY_TEMPLATES.map((template) => (
            <div key={template.id} className={styles.templateCard}>
              <div className={styles.templateEmoji}>{template.emoji}</div>
              <div className={styles.templateName}>{template.name}</div>
              <div className={styles.templateDesc}>{template.description}</div>
              <button
                className={styles.templateBtn}
                onClick={() => handleUseTemplate(template)}
              >
                Use Template
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign History */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Campaign History</h2>
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : campaigns.length === 0 ? (
          <div className={styles.empty}>
            <p>No campaigns sent yet</p>
            <p className={styles.emptyHint}>Click "Compose Email" to send your first marketing email</p>
          </div>
        ) : (
          <div className={styles.campaignList}>
            {campaigns.map((campaign) => (
              <div key={campaign.id} className={styles.campaignItem}>
                <div className={styles.campaignInfo}>
                  <h3 className={styles.campaignSubject}>{campaign.subject}</h3>
                  <div className={styles.campaignMeta}>
                    <span>{formatDate(campaign.sentAt || campaign.createdAt)}</span>
                    <span className={styles.dot}>·</span>
                    <span>{campaign.recipientCount || 0} recipients</span>
                  </div>
                </div>
                <Badge variant={campaign.status === 'SENT' ? 'success' : campaign.status === 'FAILED' ? 'error' : 'warning'}>
                  {campaign.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Send Modal - Only modal remaining */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Send"
        size="sm"
      >
        <div className={styles.confirmContent}>
          <p>Are you sure you want to send this email to <strong>all customers</strong> with email notifications enabled?</p>
          <p className={styles.confirmSubject}>Subject: <strong>{subject}</strong></p>
          <div className={styles.confirmActions}>
            <Button variant="ghost" onClick={() => setShowConfirm(false)} disabled={sending}>
              Cancel
            </Button>
            <Button onClick={handleSendToAll} loading={sending}>
              Yes, Send to All
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Marketing;
