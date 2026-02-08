const { Customer, MarketingCampaign } = require('../../models');
const { sendEmail } = require('../../utils/email');
const ApiError = require('../../utils/ApiError');
const { formatDocument, formatDocuments } = require('../../utils/responseFormatter');
const { paginate } = require('../../utils/helpers');

class MarketingService {
  async getCampaigns(query) {
    const { page, limit, skip } = paginate(query.page, query.limit);
    const campaigns = await MarketingCampaign.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sentBy', 'name email')
      .lean();

    const total = await MarketingCampaign.countDocuments();

    return {
      items: formatDocuments(campaigns),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getCampaignById(id) {
    const campaign = await MarketingCampaign.findById(id)
      .populate('sentBy', 'name email')
      .lean();
    if (!campaign) throw ApiError.notFound('Campaign not found');
    return formatDocument(campaign);
  }

  async sendTestEmail(data) {
    if (!data.testEmail) throw ApiError.badRequest('Test email is required');

    await sendEmail({
      to: data.testEmail,
      subject: `[TEST] ${data.subject}`,
      templateName: 'marketing-email',
      variables: {
        subject: data.subject,
        body: data.body,
      },
    });

    return { message: 'Test email sent successfully' };
  }

  async sendCampaign(data, adminUserId) {
    // Create campaign record
    const campaign = await MarketingCampaign.create({
      subject: data.subject,
      body: data.body,
      sentBy: adminUserId,
      status: 'SENDING',
      sentAt: new Date(),
    });

    // Get all active customers with email
    const customers = await Customer.find({
      status: 'ACTIVE',
      email: { $exists: true, $ne: null },
    }).select('email name firstName').lean();

    campaign.recipientCount = customers.length;

    if (customers.length === 0) {
      campaign.status = 'SENT';
      campaign.successCount = 0;
      await campaign.save();
      return formatDocument(campaign.toObject());
    }

    // Send emails to all customers
    let successCount = 0;
    let failCount = 0;

    for (const customer of customers) {
      try {
        await sendEmail({
          to: customer.email,
          subject: data.subject,
          templateName: 'marketing-email',
          variables: {
            subject: data.subject,
            body: data.body,
          },
        });
        successCount++;
      } catch (err) {
        failCount++;
        console.error(`Failed to send marketing email to ${customer.email}:`, err.message);
      }
    }

    campaign.successCount = successCount;
    campaign.failCount = failCount;
    campaign.status = failCount === customers.length ? 'FAILED' : 'SENT';
    await campaign.save();

    return formatDocument(campaign.toObject());
  }
}

module.exports = new MarketingService();
