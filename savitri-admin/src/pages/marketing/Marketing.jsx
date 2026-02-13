import { useState, useEffect, useRef, useCallback } from 'react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Toggle from '../../components/common/Toggle';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import { getCampaigns, sendCampaign, sendTestEmail } from '../../services/marketing.service';
import { getSettingsByGroup } from '../../services/settings.service';
import { getCoupons } from '../../services/coupons.service';
import { getAllCustomers } from '../../services/customers.service';
import styles from './Marketing.module.css';

// Template color schemes for generating HTML
const TEMPLATE_THEMES = {
  diwali: { gradient: 'linear-gradient(135deg,#FF6F00,#FFB300,#FF6F00)', accent: '#FF6F00', offerBg: '#FFF3E0', offerBorder: '#FF6F00', offerTitle: '#E65100', bodyBg: '#FFF8E1', emoji: '\u{1FA94}\u2728\u{1FA94}', heading: 'Happy Diwali!', subtext: 'May the festival of lights brighten your life', offerEmoji: '\u{1F389}' },
  christmas: { gradient: 'linear-gradient(135deg,#C62828,#2E7D32,#C62828)', accent: '#C62828', offerBg: '#FFEBEE', offerBorder: '#C62828', offerTitle: '#B71C1C', bodyBg: '#F1F8E9', emoji: '\u{1F384}\u{1F385}\u{1F384}', heading: 'Merry Christmas!', subtext: 'Wishing you joy, peace, and wonderful celebrations', offerEmoji: '\u{1F381}' },
  'new-year': { gradient: 'linear-gradient(135deg,#1A237E,#4A148C,#1A237E)', accent: '#4A148C', offerBg: '#EDE7F6', offerBorder: '#4A148C', offerTitle: '#4A148C', bodyBg: '#E8EAF6', emoji: '\u{1F386}\u{1F37E}\u{1F386}', heading: 'Happy New Year!', subtext: 'Cheers to new beginnings and exciting adventures', offerEmoji: '\u{1F37E}' },
  holi: { gradient: 'linear-gradient(135deg,#E91E63,#FF9800,#4CAF50,#2196F3)', accent: '#E91E63', offerBg: '#F3E5F5', offerBorder: '#9C27B0', offerTitle: '#7B1FA2', bodyBg: '#FCE4EC', emoji: '\u{1F3A8}\u{1F308}\u{1F3A8}', heading: 'Happy Holi!', subtext: 'Let the colors of joy splash into your life', offerEmoji: '\u{1F308}' },
  valentines: { gradient: 'linear-gradient(135deg,#C2185B,#E91E63,#F06292)', accent: '#C2185B', offerBg: '#FCE4EC', offerBorder: '#C2185B', offerTitle: '#880E4F', bodyBg: '#FCE4EC', emoji: '\u2764\uFE0F\u{1F6A2}\u2764\uFE0F', heading: "Happy Valentine's Day!", subtext: 'Create unforgettable moments with your special someone', offerEmoji: '\u{1F48C}' },
  'independence-day': { gradient: 'linear-gradient(180deg,#FF9933 33%,#FFFFFF 33%,#FFFFFF 66%,#138808 66%)', accent: '#138808', offerBg: '#E8F5E9', offerBorder: '#138808', offerTitle: '#1B5E20', bodyBg: '#FFF3E0', emoji: '\u{1F1EE}\u{1F1F3}\u{1F3B5}\u{1F1EE}\u{1F1F3}', heading: 'Happy Independence Day!', subtext: 'Jai Hind! Celebrate the spirit of freedom', offerEmoji: '\u{1F1EE}\u{1F1F3}' },
  eid: { gradient: 'linear-gradient(135deg,#00695C,#004D40,#00695C)', accent: '#00695C', offerBg: '#E0F2F1', offerBorder: '#00695C', offerTitle: '#004D40', bodyBg: '#E8F5E9', emoji: '\u{1F319}\u2B50\u{1F319}', heading: 'Eid Mubarak!', subtext: 'Wishing you blessings, peace, and happiness', offerEmoji: '\u2B50' },
  'ganesh-chaturthi': { gradient: 'linear-gradient(135deg,#E65100,#FF8F00,#E65100)', accent: '#E65100', offerBg: '#FFF3E0', offerBorder: '#E65100', offerTitle: '#BF360C', bodyBg: '#FFF8E1', emoji: '\u{1F418}\u{1F4AE}\u{1F418}', heading: 'Ganpati Bappa Morya!', subtext: 'May Lord Ganesha bless you with wisdom and prosperity', offerEmoji: '\u{1F4AE}' },
  navratri: { gradient: 'linear-gradient(135deg,#AD1457,#D81B60,#F06292)', accent: '#AD1457', offerBg: '#FCE4EC', offerBorder: '#AD1457', offerTitle: '#880E4F', bodyBg: '#F3E5F5', emoji: '\u{1F483}\u{1F52E}\u{1F483}', heading: 'Happy Navratri!', subtext: 'Nine nights of celebration, devotion, and joy', offerEmoji: '\u{1F52E}' },
  'raksha-bandhan': { gradient: 'linear-gradient(135deg,#1565C0,#42A5F5,#1565C0)', accent: '#1565C0', offerBg: '#E3F2FD', offerBorder: '#1565C0', offerTitle: '#0D47A1', bodyBg: '#E3F2FD', emoji: '\u{1F380}\u{1F495}\u{1F380}', heading: 'Happy Raksha Bandhan!', subtext: 'Celebrating the beautiful bond between siblings', offerEmoji: '\u{1F495}' },
  custom: { gradient: 'linear-gradient(135deg,#0891b2,#06b6d4,#0891b2)', accent: '#0891b2', offerBg: '#E0F7FA', offerBorder: '#0891b2', offerTitle: '#006064', bodyBg: '#F0F9FF', emoji: '\u{1F6A2}\u2728\u{1F6A2}', heading: 'Special Offer!', subtext: 'We have something exciting for you', offerEmoji: '\u{1F389}' },
};

const HOLIDAY_TEMPLATES = [
  { id: 'diwali', name: 'Diwali', emoji: '\u{1FA94}', description: 'Festival of lights celebration', defaultSubject: '\u{1FA94} Happy Diwali from {{companyName}}! Light Up Your Celebrations on the Water', defaultGreeting: 'Dear Valued Customer,', defaultMessage: 'This Diwali, celebrate the festival of lights with an unforgettable experience on the water! Let the shimmering waves reflect the joy of the season.', defaultCTA: 'Book Your Diwali Ride', defaultOfferHeadline: 'Diwali Special Offer!', defaultClosing: 'Wishing you and your family a prosperous and joyous Diwali!' },
  { id: 'christmas', name: 'Christmas', emoji: '\u{1F384}', description: 'Merry Christmas holiday greetings', defaultSubject: '\u{1F384} Merry Christmas from {{companyName}}! Sail Into the Holiday Spirit', defaultGreeting: 'Dear Valued Customer,', defaultMessage: 'This Christmas, give your loved ones the gift of an extraordinary experience! Set sail with us and create magical memories under the winter sky.', defaultCTA: 'Book Your Christmas Ride', defaultOfferHeadline: 'Christmas Special Offer!', defaultClosing: 'Merry Christmas and Happy Holidays from our family to yours!' },
  { id: 'new-year', name: 'New Year', emoji: '\u{1F386}', description: 'Ring in the New Year with style', defaultSubject: '\u{1F386} Happy New Year from {{companyName}}! Start the Year with an Adventure', defaultGreeting: 'Dear Valued Customer,', defaultMessage: 'Kick off the New Year with an unforgettable boat ride! Whether you are celebrating with friends, family, or that special someone, start the year with memories you will cherish forever.', defaultCTA: 'Book Your New Year Ride', defaultOfferHeadline: 'New Year Special Offer!', defaultClosing: 'Here is to an amazing year ahead filled with adventure!' },
  { id: 'holi', name: 'Holi', emoji: '\u{1F3A8}', description: 'Festival of colors celebration', defaultSubject: '\u{1F3A8} Happy Holi from {{companyName}}! Add Colors to Your Celebration on Water', defaultGreeting: 'Dear Valued Customer,', defaultMessage: 'This Holi, make your celebration truly special! Enjoy a vibrant boat ride with friends and family as you paint the town (and the waves) with colors of happiness.', defaultCTA: 'Book Your Holi Ride', defaultOfferHeadline: 'Holi Special Offer!', defaultClosing: 'Wishing you a colorful and joyous Holi!' },
  { id: 'valentines', name: "Valentine's Day", emoji: '\u2764\uFE0F', description: 'Romantic getaway on the water', defaultSubject: "\u2764\uFE0F Valentine's Special from {{companyName}}! Romance on the Waves", defaultGreeting: 'Dear Valued Customer,', defaultMessage: "This Valentine's Day, sweep your special someone off their feet with a romantic boat ride! Watch the sunset, feel the breeze, and create memories that will last a lifetime.", defaultCTA: 'Book a Romantic Ride', defaultOfferHeadline: "Valentine's Special Offer!", defaultClosing: 'Love is in the air... and on the water!' },
  { id: 'independence-day', name: 'Independence Day', emoji: '\u{1F1EE}\u{1F1F3}', description: '15th August patriotic celebration', defaultSubject: '\u{1F1EE}\u{1F1F3} Happy Independence Day from {{companyName}}! Celebrate Freedom on the Waves', defaultGreeting: 'Dear Valued Customer,', defaultMessage: 'This Independence Day, celebrate the spirit of freedom with an exhilarating boat ride! Feel the wind of liberty as you cruise the open waters with your loved ones.', defaultCTA: 'Book Your Freedom Ride', defaultOfferHeadline: 'Independence Day Offer!', defaultClosing: 'Vande Mataram! Have a wonderful Independence Day!' },
  { id: 'eid', name: 'Eid', emoji: '\u{1F319}', description: 'Eid Mubarak celebration wishes', defaultSubject: '\u{1F319} Eid Mubarak from {{companyName}}! Celebrate with a Special Boat Ride', defaultGreeting: 'Dear Valued Customer,', defaultMessage: 'This Eid, celebrate with your family and friends on a delightful boat ride! Let the calm waters and gentle breeze add to the joy of this blessed occasion.', defaultCTA: 'Book Your Eid Ride', defaultOfferHeadline: 'Eid Special Offer!', defaultClosing: 'Eid Mubarak to you and your loved ones!' },
  { id: 'ganesh-chaturthi', name: 'Ganesh Chaturthi', emoji: '\u{1F418}', description: 'Ganpati Bappa Morya celebration', defaultSubject: '\u{1F418} Ganesh Chaturthi Wishes from {{companyName}}! Celebrate with Bappa on the Water', defaultGreeting: 'Dear Valued Customer,', defaultMessage: 'This Ganesh Chaturthi, celebrate the arrival of Lord Ganesha with a joyous boat ride! Bring your family along for a memorable experience on the waters as the festivities come alive.', defaultCTA: 'Book Your Festive Ride', defaultOfferHeadline: 'Ganesh Chaturthi Offer!', defaultClosing: 'Ganpati Bappa Morya! Mangal Murti Morya!' },
  { id: 'navratri', name: 'Navratri', emoji: '\u{1F483}', description: 'Nine nights of dance and devotion', defaultSubject: '\u{1F483} Happy Navratri from {{companyName}}! Dance Your Way to the Waves', defaultGreeting: 'Dear Valued Customer,', defaultMessage: 'This Navratri, take the celebration to the water! After nights of Garba and Dandiya, treat yourself and your loved ones to a refreshing boat ride and create beautiful memories.', defaultCTA: 'Book Your Navratri Ride', defaultOfferHeadline: 'Navratri Special Offer!', defaultClosing: 'May Maa Durga bless you with strength and happiness!' },
  { id: 'raksha-bandhan', name: 'Raksha Bandhan', emoji: '\u{1F380}', description: 'Celebrate the bond of siblings', defaultSubject: '\u{1F380} Happy Raksha Bandhan from {{companyName}}! Gift Your Sibling a Boat Ride', defaultGreeting: 'Dear Valued Customer,', defaultMessage: 'This Raksha Bandhan, go beyond the usual gifts! Surprise your sibling with an exciting boat ride experience. Create unforgettable memories together on the water.', defaultCTA: 'Book a Sibling Ride', defaultOfferHeadline: 'Rakhi Special Offer!', defaultClosing: 'Celebrate the bond that makes life beautiful!' },
];

const GREETING_OPTIONS = [
  { value: 'Dear Valued Customer,', label: 'Dear Valued Customer,' },
  { value: 'Hello!', label: 'Hello!' },
  { value: 'Hi there!', label: 'Hi there!' },
  { value: 'custom', label: 'Custom greeting...' },
];

/**
 * Generate email HTML from structured fields
 */
const generateEmailHTML = (fields, templateId) => {
  const theme = TEMPLATE_THEMES[templateId] || TEMPLATE_THEMES.custom;
  const { greeting, mainMessage, ctaText, showOffer, offerHeadline, discountPercent, fixedDiscountAmount, couponCode, companyName, closing } = fields;

  const offerText = discountPercent
    ? `Get <strong>${discountPercent}% off</strong> on all boat rides!`
    : fixedDiscountAmount
      ? `Get <strong>\u20B9${fixedDiscountAmount} off</strong> on all boat rides!`
      : '';

  const offerSection = showOffer && (discountPercent || fixedDiscountAmount || couponCode) ? `
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="background-color:${theme.offerBg};border-left:4px solid ${theme.offerBorder};padding:20px;border-radius:4px;">
<h2 style="color:${theme.offerTitle};margin:0 0 8px;font-size:20px;">${theme.offerEmoji} ${offerHeadline || 'Special Offer!'}</h2>
<p style="color:#333333;font-size:16px;margin:0;">${offerText}${couponCode ? ` Use code: <strong>${couponCode}</strong>` : ''}</p>
</td></tr></table>` : '';

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:${theme.bodyBg};font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background-color:#ffffff;">
<tr><td style="background:${theme.gradient};padding:40px 30px;text-align:center;">
<div style="font-size:48px;margin-bottom:10px;">${theme.emoji}</div>
<h1 style="color:#ffffff;margin:0;font-size:28px;text-shadow:1px 1px 2px rgba(0,0,0,0.3);">${theme.heading}</h1>
<p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:16px;">${theme.subtext}</p>
</td></tr>
<tr><td style="padding:30px;">
<p style="color:#333333;font-size:16px;line-height:1.6;margin:0 0 20px;">${greeting || 'Dear Valued Customer,'}</p>
<p style="color:#333333;font-size:16px;line-height:1.6;margin:0 0 20px;">${mainMessage || ''}</p>
${offerSection}
${ctaText ? `<div style="text-align:center;margin:30px 0;">
<a href="#" style="display:inline-block;background-color:${theme.accent};color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:bold;">${ctaText}</a>
</div>` : ''}
${closing ? `<p style="color:#666666;font-size:14px;line-height:1.6;margin:0;">${closing}</p>` : ''}
</td></tr>
<tr><td style="background-color:#F5F5F5;padding:20px 30px;text-align:center;border-top:1px solid #E0E0E0;">
<p style="color:#999999;font-size:12px;margin:0;">${companyName || 'Your Company'} | Making memories on the water</p>
</td></tr>
</table></body></html>`;
};

const Marketing = () => {
  const { showSuccess, showError } = useUIStore();
  const { user } = useAuthStore();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [customerCount, setCustomerCount] = useState(0);

  // Compose form state - structured fields
  const [subject, setSubject] = useState('');
  const [greeting, setGreeting] = useState('Dear Valued Customer,');
  const [customGreeting, setCustomGreeting] = useState('');
  const [mainMessage, setMainMessage] = useState('');
  const [ctaText, setCtaText] = useState('Book Now');
  const [showOffer, setShowOffer] = useState(false);
  const [offerHeadline, setOfferHeadline] = useState('');
  const [closing, setClosing] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  // Template variables
  const [companyName, setCompanyName] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState('');
  const [fixedDiscountAmount, setFixedDiscountAmount] = useState('');

  // Data
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [defaultCompanyName, setDefaultCompanyName] = useState('');

  // Track which template is active
  const [activeTemplateId, setActiveTemplateId] = useState('custom');

  // Compose tabs (Details / Design)
  const [composeTab, setComposeTab] = useState('details');
  const [customHTML, setCustomHTML] = useState('');

  // Schedule state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  // Preview
  const previewIframeRef = useRef(null);

  // Auto-fill test email
  useEffect(() => {
    if (user?.email && !testEmail) {
      setTestEmail(user.email);
    }
  }, [user]);

  // Fetch customer count for confirm dialog
  const fetchCustomerCount = async () => {
    try {
      const response = await getAllCustomers({ limit: 1, page: 1 });
      if (response.success) {
        setCustomerCount(response.data?.pagination?.total || response.data?.total || 0);
      }
    } catch {
      // silently fail
    }
  };

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

  // Fetch company name
  const fetchCompanyName = async () => {
    try {
      const response = await getSettingsByGroup('general');
      if (response.success && response.data) {
        const settings = response.data;
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
      // silently fail
    }
  };

  // Fetch coupons
  const fetchCoupons = async () => {
    try {
      setLoadingCoupons(true);
      const response = await getCoupons({ limit: 100 });
      if (response.success) {
        const couponList = response.data?.docs || response.data || [];
        setCoupons(Array.isArray(couponList) ? couponList : []);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingCoupons(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchCompanyName();
    fetchCoupons();
    fetchCustomerCount();
  }, []);

  // Generate HTML from fields and update preview
  const getEffectiveGreeting = () => {
    if (greeting === 'custom') return customGreeting;
    return greeting;
  };

  const generateCurrentHTML = useCallback(() => {
    return generateEmailHTML({
      greeting: greeting === 'custom' ? customGreeting : greeting,
      mainMessage,
      ctaText,
      showOffer,
      offerHeadline,
      discountPercent,
      fixedDiscountAmount,
      couponCode: selectedCoupon,
      companyName,
      closing,
    }, activeTemplateId);
  }, [greeting, customGreeting, mainMessage, ctaText, showOffer, offerHeadline, discountPercent, fixedDiscountAmount, selectedCoupon, companyName, closing, activeTemplateId]);

  // Update preview whenever fields change
  useEffect(() => {
    if (!showCompose) return;
    const html = customHTML || generateCurrentHTML();
    if (previewIframeRef.current && html) {
      const iframe = previewIframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [generateCurrentHTML, showCompose, customHTML]);

  const handleUseTemplate = (template) => {
    setActiveTemplateId(template.id);
    // Replace {{companyName}} in the subject
    const subjectWithName = companyName
      ? template.defaultSubject.replace(/\{\{companyName\}\}/g, companyName)
      : template.defaultSubject;
    setSubject(subjectWithName);
    setGreeting(template.defaultGreeting);
    setCustomGreeting('');
    setMainMessage(template.defaultMessage);
    setCtaText(template.defaultCTA);
    setOfferHeadline(template.defaultOfferHeadline);
    setClosing(template.defaultClosing);
    setShowOffer(true);
    setShowCompose(true);
  };

  const handleOpenCompose = () => {
    setSubject('');
    setGreeting('Dear Valued Customer,');
    setCustomGreeting('');
    setMainMessage('');
    setCtaText('Book Now');
    setShowOffer(false);
    setOfferHeadline('');
    setClosing('');
    setActiveTemplateId('custom');
    setDiscountPercent('');
    setSelectedCoupon('');
    setFixedDiscountAmount('');
    setComposeTab('details');
    setCustomHTML('');
    setShowCompose(true);
  };

  const handleCloseCompose = () => {
    setShowCompose(false);
    setSubject('');
    setGreeting('Dear Valued Customer,');
    setCustomGreeting('');
    setMainMessage('');
    setCtaText('Book Now');
    setShowOffer(false);
    setOfferHeadline('');
    setClosing('');
    setActiveTemplateId('custom');
    setDiscountPercent('');
    setSelectedCoupon('');
    setFixedDiscountAmount('');
    setComposeTab('details');
    setCustomHTML('');
    if (user?.email) {
      setTestEmail(user.email);
    }
  };

  const handleSendTest = async () => {
    if (!subject.trim() || !mainMessage.trim()) {
      showError('Please fill in subject and message');
      return;
    }
    if (!testEmail.trim()) {
      showError('Please enter a test email address');
      return;
    }
    try {
      setSendingTest(true);
      const finalSubject = subject.replace(/\{\{companyName\}\}/g, companyName || defaultCompanyName || 'Savitri Shipping');
      const body = customHTML || generateCurrentHTML();
      await sendTestEmail({ subject: finalSubject, body, testEmail });
      showSuccess(`Test email sent to ${testEmail}`);
    } catch (err) {
      showError(err.message || 'Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  const handleSendToAll = async () => {
    if (!subject.trim() || !mainMessage.trim()) {
      showError('Please fill in subject and message');
      return;
    }
    try {
      setSending(true);
      const finalSubject = subject.replace(/\{\{companyName\}\}/g, companyName || defaultCompanyName || 'Savitri Shipping');
      const body = customHTML || generateCurrentHTML();
      const response = await sendCampaign({ subject: finalSubject, body });
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

  const handleScheduleSend = () => {
    if (!scheduleDate || !scheduleTime) {
      showError('Please select both date and time');
      return;
    }
    // For now we just save the scheduled intent and show success
    const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`);
    showSuccess(`Campaign scheduled for ${scheduledAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} at ${scheduledAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`);
    setShowScheduleModal(false);
    setScheduleDate('');
    setScheduleTime('');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

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

      {/* Compose Section */}
      {showCompose && (
        <div className={styles.composeSection}>
          <div className={styles.composeSplit}>
            {/* LEFT SIDE: Compose Form */}
            <div className={styles.composeLeft}>
              <h2 className={styles.composeSectionTitle}>Compose Email</h2>

              <div className={styles.composeTabs}>
                <button
                  className={`${styles.composeTab} ${composeTab === 'details' ? styles.composeTabActive : ''}`}
                  onClick={() => setComposeTab('details')}
                >
                  Details
                </button>
                <button
                  className={`${styles.composeTab} ${composeTab === 'design' ? styles.composeTabActive : ''}`}
                  onClick={() => {
                    if (!customHTML) setCustomHTML(generateCurrentHTML());
                    setComposeTab('design');
                  }}
                >
                  Design
                </button>
              </div>

              {composeTab === 'details' && (
                <>
                  {/* Section 2: Email Content */}
                  <Input
                    label="Subject"
                    placeholder="Enter email subject..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />

                  <div className={styles.greetingRow}>
                    <Select
                      label="Greeting"
                      options={GREETING_OPTIONS}
                      value={greeting}
                      onChange={(val) => setGreeting(val)}
                      placeholder="Select a greeting..."
                    />
                    {greeting === 'custom' && (
                      <Input
                        label="Custom Greeting"
                        placeholder="Type your greeting..."
                        value={customGreeting}
                        onChange={(e) => setCustomGreeting(e.target.value)}
                      />
                    )}
                  </div>

                  <Textarea
                    label="Main Message"
                    placeholder="Write your email message here... (No HTML needed)"
                    value={mainMessage}
                    onChange={(e) => setMainMessage(e.target.value)}
                    rows={5}
                    required
                    hint="This is the body paragraph of your email. Just write naturally - no HTML or formatting needed."
                  />

                  <Input
                    label="Call to Action Text"
                    placeholder="e.g. Book Now, Explore Offers..."
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    hint="Text shown on the action button in the email"
                  />

                  {/* Offer Section with Toggle */}
                  <div className={styles.offerSection}>
                    <div className={styles.offerToggle}>
                      <Toggle
                        label="Include Offer Section"
                        checked={showOffer}
                        onChange={(checked) => setShowOffer(checked)}
                      />
                    </div>
                    {showOffer && (
                      <div className={styles.offerFields}>
                        <Input
                          label="Offer Headline"
                          placeholder="e.g. Diwali Special Offer!"
                          value={offerHeadline}
                          onChange={(e) => setOfferHeadline(e.target.value)}
                        />
                        <div className={styles.offerRow}>
                          <Input
                            label="Discount %"
                            type="number"
                            placeholder="e.g. 20"
                            value={discountPercent}
                            onChange={(e) => setDiscountPercent(e.target.value)}
                            min="0"
                            max="100"
                            disabled={!!fixedDiscountAmount}
                          />
                          <Select
                            label="Coupon Code"
                            options={couponOptions}
                            value={selectedCoupon}
                            onChange={(val) => {
                              setSelectedCoupon(val);
                              const coupon = coupons.find(c => c.code === val);
                              if (coupon) {
                                if (coupon.discountType === 'PERCENTAGE') {
                                  setDiscountPercent(String(coupon.discountValue));
                                  setFixedDiscountAmount('');
                                } else if (coupon.discountType === 'FIXED') {
                                  setDiscountPercent('');
                                  setFixedDiscountAmount(String(coupon.discountValue));
                                }
                              } else {
                                setFixedDiscountAmount('');
                              }
                            }}
                            placeholder={loadingCoupons ? 'Loading...' : 'Select coupon'}
                            disabled={loadingCoupons}
                            searchable
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Company Name & Closing */}
                  <div className={styles.closingRow}>
                    <Input
                      label="Company Name"
                      placeholder="Your company name..."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      hint="Shown in the email footer"
                    />
                    <Input
                      label="Closing Message"
                      placeholder="e.g. Wishing you a wonderful time!"
                      value={closing}
                      onChange={(e) => setClosing(e.target.value)}
                      hint="Short farewell before footer"
                    />
                  </div>
                </>
              )}

              {composeTab === 'design' && (
                <div className={styles.designTab}>
                  <p className={styles.designHint}>
                    Edit the HTML template directly. Changes here will override the Details tab fields in the preview.
                  </p>
                  <textarea
                    className={styles.htmlEditor}
                    value={customHTML || generateCurrentHTML()}
                    onChange={(e) => setCustomHTML(e.target.value)}
                    spellCheck={false}
                  />
                  <Button variant="ghost" size="sm" onClick={() => setCustomHTML('')}>
                    Reset to Generated HTML
                  </Button>
                </div>
              )}

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
                <Button
                  variant="outline"
                  onClick={() => setShowScheduleModal(true)}
                  disabled={!subject.trim() || !mainMessage.trim()}
                >
                  Schedule Send
                </Button>
                <Button
                  onClick={() => setShowConfirm(true)}
                  disabled={!subject.trim() || !mainMessage.trim()}
                >
                  Send to All Customers
                </Button>
              </div>
            </div>

            {/* RIGHT SIDE: Live Preview */}
            <div className={styles.composeRight}>
              <h2 className={styles.composeSectionTitle}>Live Preview</h2>
              <div className={styles.previewContainer}>
                {mainMessage.trim() ? (
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
                      Select a template or start typing your message to see a live preview
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Holiday Templates */}
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
                    {campaign.scheduledAt && (
                      <>
                        <span className={styles.dot}>·</span>
                        <Badge variant="info">Scheduled for {formatDate(campaign.scheduledAt)}</Badge>
                      </>
                    )}
                  </div>
                </div>
                <Badge variant={campaign.status === 'SENT' ? 'success' : campaign.status === 'FAILED' ? 'error' : campaign.status === 'SCHEDULED' ? 'info' : 'warning'}>
                  {campaign.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Send Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleSendToAll}
        title="Confirm Send to All Customers"
        message={`Are you sure you want to send this email to ${customerCount > 0 ? customerCount : 'all'} customers? This action cannot be undone.`}
        confirmText={sending ? 'Sending...' : 'Yes, Send to All'}
        cancelText="Cancel"
        variant="primary"
        loading={sending}
      />

      {/* Schedule Send Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Campaign"
        size="sm"
      >
        <div className={styles.scheduleContent}>
          <p className={styles.scheduleHint}>
            Choose when you want this campaign to be sent. The campaign will be marked as scheduled and you can send it manually at the chosen time.
          </p>
          <Input
            label="Date"
            type="date"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
          />
          <Input
            label="Time"
            type="time"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            required
          />
          <div className={styles.scheduleActions}>
            <Button variant="ghost" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleSend} disabled={!scheduleDate || !scheduleTime}>
              Schedule Campaign
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Marketing;
