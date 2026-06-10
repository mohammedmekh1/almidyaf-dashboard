// Mock Data for Almidyaf Dashboard
// This data structure matches the Google Sheets schema

export interface Lead {
  lead_id: string;
  phone: string;
  name: string;
  source: string;
  platform: string;
  detected_product: string;
  quantity: number;
  location_hint: string;
  category: 'hot' | 'warm' | 'cool' | 'cold';
  status: string;
  score: number;
  final_score: number;
  intent: string;
  urgency: string;
  final_contact_channel: string;
  has_phone: boolean;
  consent: boolean;
  created_at: string;
  updated_at: string;
  flow_origin: string;
  is_demo: boolean;
}

export interface Order {
  order_id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  main_product: string;
  total: number;
  currency: string;
  items_summary: string;
  shipping_address: string;
  status: string;
  created_at: string;
  flow_origin: string;
}

export interface Delivery {
  delivery_id: string;
  lead_id: string;
  phone: string;
  channel: string;
  status: 'delivered' | 'failed';
  product_type: string;
  sent_at: string;
  delivered_at: string;
  error_reason: string;
  flow_trigger: string;
}

export interface SalesTask {
  task_id: string;
  lead_id: string;
  name: string;
  phone: string;
  score: number;
  category: 'hot' | 'warm' | 'cool' | 'cold';
  product_label: string;
  quantity: number;
  event_type: string;
  location: string;
  action_required: string;
  task_status: 'open' | 'escalated' | 'closed';
  assigned_to: string;
  priority: string;
  sla_minutes: number;
  created_at: string;
}

export interface CustomerService {
  cs_id: string;
  phone: string;
  name: string;
  message: string;
  intent: string;
  auto_reply_sent: boolean;
  needs_human: boolean;
  priority: string;
  channel: string;
  received_at: string;
  flow_origin: string;
}

export interface Content {
  article_id: string;
  meta_title: string;
  keyword_main: string;
  seo_score: number;
  status: 'pending_upload' | 'published' | 'failed';
  salla_url: string;
  published_at: string;
}

// Mock Leads Data
export const mockLeads: Lead[] = [
  {
    lead_id: 'L001',
    phone: '+966501234567',
    name: 'أحمد محمد',
    source: 'instagram',
    platform: 'instagram',
    detected_product: 'full_carcass',
    quantity: 1,
    location_hint: 'الرياض - الروضة',
    category: 'hot',
    status: 'new_hot',
    score: 95,
    final_score: 92,
    intent: 'purchase',
    urgency: 'high',
    final_contact_channel: 'whatsapp',
    has_phone: true,
    consent: true,
    created_at: '2026-06-01T10:30:00Z',
    updated_at: '2026-06-01T14:20:00Z',
    flow_origin: 'instagram_dm',
    is_demo: false,
  },
  {
    lead_id: 'L002',
    phone: '+966502345678',
    name: 'فاطمة علي',
    source: 'google',
    platform: 'google_search',
    detected_product: 'half_carcass',
    quantity: 2,
    location_hint: 'الرياض - النخيل',
    category: 'hot',
    status: 'new_hot',
    score: 88,
    final_score: 85,
    intent: 'purchase',
    urgency: 'high',
    final_contact_channel: 'phone',
    has_phone: true,
    consent: true,
    created_at: '2026-06-01T11:15:00Z',
    updated_at: '2026-06-01T15:45:00Z',
    flow_origin: 'google_search',
    is_demo: false,
  },
  {
    lead_id: 'L003',
    phone: '+966503456789',
    name: 'محمد سالم',
    source: 'tiktok',
    platform: 'tiktok',
    detected_product: 'kg_meat',
    quantity: 5,
    location_hint: 'الرياض - العليا',
    category: 'warm',
    status: 'scored',
    score: 72,
    final_score: 70,
    intent: 'inquiry',
    urgency: 'medium',
    final_contact_channel: 'whatsapp',
    has_phone: true,
    consent: true,
    created_at: '2026-05-31T14:20:00Z',
    updated_at: '2026-06-01T09:30:00Z',
    flow_origin: 'tiktok_video',
    is_demo: false,
  },
  {
    lead_id: 'L004',
    phone: '+966504567890',
    name: 'سارة خالد',
    source: 'facebook',
    platform: 'facebook',
    detected_product: 'events_catering',
    quantity: 50,
    location_hint: 'الرياض - الشرقية',
    category: 'hot',
    status: 'new_hot',
    score: 91,
    final_score: 89,
    intent: 'purchase',
    urgency: 'high',
    final_contact_channel: 'phone',
    has_phone: true,
    consent: true,
    created_at: '2026-06-01T08:45:00Z',
    updated_at: '2026-06-01T16:10:00Z',
    flow_origin: 'facebook_ad',
    is_demo: false,
  },
  {
    lead_id: 'L005',
    phone: '+966505678901',
    name: 'علي حسن',
    source: 'referral',
    platform: 'referral',
    detected_product: 'live_sheep',
    quantity: 3,
    location_hint: 'الرياض - الملز',
    category: 'cool',
    status: 'scored',
    score: 55,
    final_score: 52,
    intent: 'inquiry',
    urgency: 'low',
    final_contact_channel: 'email',
    has_phone: true,
    consent: false,
    created_at: '2026-05-30T12:00:00Z',
    updated_at: '2026-06-01T10:15:00Z',
    flow_origin: 'referral_friend',
    is_demo: false,
  },
  {
    lead_id: 'L006',
    phone: '+966506789012',
    name: 'نور محمود',
    source: 'instagram',
    platform: 'instagram',
    detected_product: 'quarter_carcass',
    quantity: 1,
    location_hint: 'الرياض - السليمانية',
    category: 'warm',
    status: 'scored',
    score: 78,
    final_score: 75,
    intent: 'inquiry',
    urgency: 'medium',
    final_contact_channel: 'whatsapp',
    has_phone: true,
    consent: true,
    created_at: '2026-06-01T13:30:00Z',
    updated_at: '2026-06-01T17:00:00Z',
    flow_origin: 'instagram_story',
    is_demo: false,
  },
];

// Mock Orders Data
export const mockOrders: Order[] = [
  {
    order_id: 'O001',
    order_number: '#2026-001',
    customer_name: 'أحمد محمد',
    phone: '+966501234567',
    main_product: 'ذبيحة كاملة',
    total: 450,
    currency: 'ر.س',
    items_summary: 'ذبيحة كاملة - 25 كغ',
    shipping_address: 'الرياض - الروضة',
    status: 'delivered',
    created_at: '2026-06-01T10:30:00Z',
    flow_origin: 'instagram_dm',
  },
  {
    order_id: 'O002',
    order_number: '#2026-002',
    customer_name: 'فاطمة علي',
    phone: '+966502345678',
    main_product: 'نصف ذبيحة',
    total: 280,
    currency: 'ر.س',
    items_summary: 'نصف ذبيحة - 12 كغ',
    shipping_address: 'الرياض - النخيل',
    status: 'delivered',
    created_at: '2026-06-01T11:15:00Z',
    flow_origin: 'google_search',
  },
  {
    order_id: 'O003',
    order_number: '#2026-003',
    customer_name: 'محمد سالم',
    phone: '+966503456789',
    main_product: 'لحم مفروم',
    total: 125,
    currency: 'ر.س',
    items_summary: 'لحم مفروم - 5 كغ',
    shipping_address: 'الرياض - العليا',
    status: 'pending',
    created_at: '2026-06-01T14:20:00Z',
    flow_origin: 'tiktok_video',
  },
  {
    order_id: 'O004',
    order_number: '#2026-004',
    customer_name: 'سارة خالد',
    phone: '+966504567890',
    main_product: 'خدمة الحفلات',
    total: 1500,
    currency: 'ر.س',
    items_summary: 'خدمة الحفلات - 50 شخص',
    shipping_address: 'الرياض - الشرقية',
    status: 'processing',
    created_at: '2026-06-01T08:45:00Z',
    flow_origin: 'facebook_ad',
  },
  {
    order_id: 'O005',
    order_number: '#2026-005',
    customer_name: 'نور محمود',
    phone: '+966506789012',
    main_product: 'ربع ذبيحة',
    total: 160,
    currency: 'ر.س',
    items_summary: 'ربع ذبيحة - 6 كغ',
    shipping_address: 'الرياض - السليمانية',
    status: 'delivered',
    created_at: '2026-06-01T13:30:00Z',
    flow_origin: 'instagram_story',
  },
];

// Mock Delivery Data
export const mockDeliveries: Delivery[] = [
  {
    delivery_id: 'D001',
    lead_id: 'L001',
    phone: '+966501234567',
    channel: 'whatsapp',
    status: 'delivered',
    product_type: 'full_carcass',
    sent_at: '2026-06-01T10:35:00Z',
    delivered_at: '2026-06-01T11:20:00Z',
    error_reason: '',
    flow_trigger: 'order_confirmation',
  },
  {
    delivery_id: 'D002',
    lead_id: 'L002',
    phone: '+966502345678',
    channel: 'sms',
    status: 'delivered',
    product_type: 'half_carcass',
    sent_at: '2026-06-01T11:20:00Z',
    delivered_at: '2026-06-01T11:25:00Z',
    error_reason: '',
    flow_trigger: 'order_confirmation',
  },
  {
    delivery_id: 'D003',
    lead_id: 'L003',
    phone: '+966503456789',
    channel: 'whatsapp',
    status: 'delivered',
    product_type: 'kg_meat',
    sent_at: '2026-06-01T14:25:00Z',
    delivered_at: '2026-06-01T14:30:00Z',
    error_reason: '',
    flow_trigger: 'follow_up',
  },
  {
    delivery_id: 'D004',
    lead_id: 'L004',
    phone: '+966504567890',
    channel: 'email',
    status: 'delivered',
    product_type: 'events_catering',
    sent_at: '2026-06-01T08:50:00Z',
    delivered_at: '2026-06-01T08:55:00Z',
    error_reason: '',
    flow_trigger: 'inquiry_response',
  },
  {
    delivery_id: 'D005',
    lead_id: 'L005',
    phone: '+966505678901',
    channel: 'email',
    status: 'failed',
    product_type: 'live_sheep',
    sent_at: '2026-06-01T12:10:00Z',
    delivered_at: '',
    error_reason: 'Invalid email address',
    flow_trigger: 'follow_up',
  },
];

// Mock Sales Tasks Data
export const mockSalesTasks: SalesTask[] = [
  {
    task_id: 'T001',
    lead_id: 'L001',
    name: 'أحمد محمد',
    phone: '+966501234567',
    score: 92,
    category: 'hot',
    product_label: 'ذبيحة كاملة',
    quantity: 1,
    event_type: 'follow_up_call',
    location: 'الرياض - الروضة',
    action_required: 'تأكيد الطلب',
    task_status: 'closed',
    assigned_to: 'محمد علي',
    priority: 'high',
    sla_minutes: 30,
    created_at: '2026-06-01T10:30:00Z',
  },
  {
    task_id: 'T002',
    lead_id: 'L002',
    name: 'فاطمة علي',
    phone: '+966502345678',
    score: 85,
    category: 'hot',
    product_label: 'نصف ذبيحة',
    quantity: 2,
    event_type: 'follow_up_call',
    location: 'الرياض - النخيل',
    action_required: 'تأكيد الطلب',
    task_status: 'closed',
    assigned_to: 'سارة محمود',
    priority: 'high',
    sla_minutes: 30,
    created_at: '2026-06-01T11:15:00Z',
  },
  {
    task_id: 'T003',
    lead_id: 'L003',
    name: 'محمد سالم',
    phone: '+966503456789',
    score: 70,
    category: 'warm',
    product_label: 'لحم مفروم',
    quantity: 5,
    event_type: 'follow_up_call',
    location: 'الرياض - العليا',
    action_required: 'توضيح الأسعار',
    task_status: 'open',
    assigned_to: 'علي محمد',
    priority: 'medium',
    sla_minutes: 60,
    created_at: '2026-06-01T14:20:00Z',
  },
  {
    task_id: 'T004',
    lead_id: 'L004',
    name: 'سارة خالد',
    phone: '+966504567890',
    score: 89,
    category: 'hot',
    product_label: 'خدمة الحفلات',
    quantity: 50,
    event_type: 'meeting',
    location: 'الرياض - الشرقية',
    action_required: 'تأكيد التفاصيل',
    task_status: 'escalated',
    assigned_to: 'مدير المبيعات',
    priority: 'high',
    sla_minutes: 15,
    created_at: '2026-06-01T08:45:00Z',
  },
  {
    task_id: 'T005',
    lead_id: 'L006',
    name: 'نور محمود',
    phone: '+966506789012',
    score: 75,
    category: 'warm',
    product_label: 'ربع ذبيحة',
    quantity: 1,
    event_type: 'follow_up_sms',
    location: 'الرياض - السليمانية',
    action_required: 'متابعة الاهتمام',
    task_status: 'open',
    assigned_to: 'فاطمة أحمد',
    priority: 'medium',
    sla_minutes: 120,
    created_at: '2026-06-01T13:30:00Z',
  },
];

// Mock Customer Service Data
export const mockCustomerService: CustomerService[] = [
  {
    cs_id: 'CS001',
    phone: '+966501234567',
    name: 'أحمد محمد',
    message: 'هل تتوفر الذبيحة الكاملة غداً؟',
    intent: 'inquiry',
    auto_reply_sent: true,
    needs_human: false,
    priority: 'normal',
    channel: 'whatsapp',
    received_at: '2026-06-01T10:45:00Z',
    flow_origin: 'whatsapp_chat',
  },
  {
    cs_id: 'CS002',
    phone: '+966502345678',
    name: 'فاطمة علي',
    message: 'الطلب وصل تالف، أريد استبدال',
    intent: 'complaint',
    auto_reply_sent: true,
    needs_human: true,
    priority: 'high',
    channel: 'whatsapp',
    received_at: '2026-06-01T15:20:00Z',
    flow_origin: 'whatsapp_chat',
  },
  {
    cs_id: 'CS003',
    phone: '+966503456789',
    name: 'محمد سالم',
    message: 'كم سعر اللحم المفروم للكيلو؟',
    intent: 'inquiry',
    auto_reply_sent: true,
    needs_human: false,
    priority: 'normal',
    channel: 'instagram',
    received_at: '2026-06-01T16:10:00Z',
    flow_origin: 'instagram_dm',
  },
  {
    cs_id: 'CS004',
    phone: '+966504567890',
    name: 'سارة خالد',
    message: 'شكراً على الخدمة الممتازة!',
    intent: 'feedback',
    auto_reply_sent: true,
    needs_human: false,
    priority: 'low',
    channel: 'whatsapp',
    received_at: '2026-06-01T17:30:00Z',
    flow_origin: 'whatsapp_chat',
  },
];

// Mock Content Data
export const mockContent: Content[] = [
  {
    article_id: 'ART001',
    meta_title: 'أفضل أنواع اللحوم الطازجة في الرياض',
    keyword_main: 'لحوم طازجة الرياض',
    seo_score: 92,
    status: 'published',
    salla_url: 'https://salla.sa/almidyaf/article-1',
    published_at: '2026-05-28T10:00:00Z',
  },
  {
    article_id: 'ART002',
    meta_title: 'كيفية اختيار اللحم الجيد للطهي',
    keyword_main: 'اختيار اللحم',
    seo_score: 85,
    status: 'published',
    salla_url: 'https://salla.sa/almidyaf/article-2',
    published_at: '2026-05-25T14:30:00Z',
  },
  {
    article_id: 'ART003',
    meta_title: 'خدمات الذبح والتوصيل المتخصصة',
    keyword_main: 'خدمة الذبح والتوصيل',
    seo_score: 78,
    status: 'published',
    salla_url: 'https://salla.sa/almidyaf/article-3',
    published_at: '2026-05-20T09:15:00Z',
  },
  {
    article_id: 'ART004',
    meta_title: 'نصائح تخزين اللحوم الطازجة',
    keyword_main: 'تخزين اللحوم',
    seo_score: 88,
    status: 'pending_upload',
    salla_url: '',
    published_at: '',
  },
  {
    article_id: 'ART005',
    meta_title: 'أضحية العيد - الخيارات والأسعار',
    keyword_main: 'أضحية العيد',
    seo_score: 95,
    status: 'published',
    salla_url: 'https://salla.sa/almidyaf/article-5',
    published_at: '2026-06-01T08:00:00Z',
  },
];

// Dashboard Summary Data
export const getDashboardSummary = () => {
  const totalLeads = mockLeads.filter(l => !l.is_demo).length;
  const hotLeads = mockLeads.filter(l => l.category === 'hot' && !l.is_demo).length;
  const totalOrders = mockOrders.length;
  const totalOrderValue = mockOrders.reduce((sum, order) => sum + order.total, 0);
  const deliveredCount = mockDeliveries.filter(d => d.status === 'delivered').length;
  const totalDeliveries = mockDeliveries.length;
  const deliverySuccessRate = totalDeliveries > 0 ? (deliveredCount / totalDeliveries) * 100 : 0;
  const openTasks = mockSalesTasks.filter(t => t.task_status === 'open').length;
  const avgScore = mockLeads.length > 0 ? mockLeads.reduce((sum, l) => sum + l.final_score, 0) / mockLeads.length : 0;
  const publishedContent = mockContent.filter(c => c.status === 'published').length;
  const pendingContent = mockContent.filter(c => c.status === 'pending_upload').length;
  const avgSeoScore = mockContent.length > 0 ? mockContent.reduce((sum, c) => sum + c.seo_score, 0) / mockContent.length : 0;

  return {
    totalLeads,
    hotLeads,
    totalOrders,
    totalOrderValue,
    deliverySuccessRate: Math.round(deliverySuccessRate),
    openTasks,
    avgScore: Math.round(avgScore * 100) / 100,
    publishedContent,
    pendingContent,
    avgSeoScore: Math.round(avgSeoScore),
  };
};
