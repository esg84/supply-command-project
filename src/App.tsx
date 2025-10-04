import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Phone, Mail, Clock, Truck, Package, X, Search, Filter } from 'lucide-react';

interface POData {
  'PO Number': string;
  'PO line': string;
  'PO Schedule Line': string;
  'Item Code': string;
  'PO Delivery Date': string;
  'PO Open Qty': string;
  'Buyer': string;
  'Buyer email': string;
  'supplier_email': string;
  'Supplier': string;
  'Supplier contact name': string;
  'Status': string;
}

interface SupplierInsight {
  'PO Number': string;
  'PO line': string;
  'PO Schedule Line': string;
  'Supplier': string;
  'Supplier contact': string;
  'Delivery Status': string;
  'Phone Escalation': string;
  'Response Time (hrs)': string;
}

interface SupplierMetrics {
  avgResponseTime: number;
  escalationRate: number;
  onTimeDeliveries: number;
  delayRate: number;
  riskScore: number;
  totalOrders: number;
}

const HappyRobotLogo = () => (
  <div className="flex items-center gap-2">
    <img src="/happy-robot-logo.png" alt="Happy Robot" className="w-6 h-6" />
    <span className="font-semibold text-xl">HappyRobot</span>
  </div>
);

const SupplierCommand: React.FC = () => {
  // ALL useState hooks must be here at the top
  const [supplierInsights, setSupplierInsights] = useState<SupplierInsight[]>([]);
  const [selectedSupplierFilter, setSelectedSupplierFilter] = useState<string>('all');
  const [activeView, setActiveView] = useState<'PO MANAGEMENT' | 'SUPPLIER INFORMATION'>('PO MANAGEMENT');
  const [activeFilter, setActiveFilter] = useState<'pending' | 'confirmed'>('pending');
  const [selectedPO, setSelectedPO] = useState<POData | null>(null);
  const [poData, setPOData] = useState<POData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBuyer, setSelectedBuyer] = useState('Carlos');
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  
  // Feature #2: Smart Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'next7' | 'overdue'>('all');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [supplierFilterPO, setSupplierFilterPO] = useState<string>('all');

  const unreliableSuppliers = ['AeroCraft Tooling Co', 'MechaSupplies Inc'];


  useEffect(() => {
    const loadData = async () => {
      try {
        // Load PO data
        const poResponse = await fetch('/suppliercommanddata.csv');
        const poContent = await poResponse.text();
        
        const poLines = poContent.split(/\r?\n/).filter(line => line.trim());
        const poHeaders = poLines[0].split(',').map(h => h.trim());
        
        const poDataArray: POData[] = [];
        for (let i = 1; i < poLines.length; i++) {
          const line = poLines[i];
          const values = line.split(',').map(v => v.trim());
          
          const row: any = {};
          poHeaders.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          if (row['PO Number']) {
            poDataArray.push(row as POData);
          }
        }
        
        // Load supplier insights data
        const insightsResponse = await fetch('/supplierinsights.csv');
        const insightsContent = await insightsResponse.text();
        
        const insightsLines = insightsContent.split(/\r?\n/).filter(line => line.trim());
        const insightsHeaders = insightsLines[0].split(',').map(h => h.trim());
        
        const insightsArray: SupplierInsight[] = [];
        for (let i = 1; i < insightsLines.length; i++) {
          const line = insightsLines[i];
          const values = line.split(',').map(v => v.trim());
          
          const row: any = {};
          insightsHeaders.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          if (row['PO Number']) {
            insightsArray.push(row as SupplierInsight);
          }
        }
        
        console.log('Successfully loaded', poDataArray.length, 'PO records');
        console.log('Successfully loaded', insightsArray.length, 'supplier insight records');
        setPOData(poDataArray);
        setSupplierInsights(insightsArray);
        setLoading(false);
      } catch (error) {
        console.error('Error loading CSV files:', error);
        
        // Fallback demo data
        const demoData: POData[] = [
          { 'PO Number': '8394266', 'PO line': '1', 'PO Schedule Line': '1', 'Item Code': '2914-1122', 'PO Delivery Date': '09/30/2025', 'PO Open Qty': '3', 'Buyer': 'Carlos', 'Buyer email': 'carlos@happyrobot.ai', 'supplier_email': 'aerocraft1@example.com', 'Supplier': 'AeroCraft Tooling Co', 'Supplier contact name': 'Miles Ortega', 'Status': 'Delivered' },
          { 'PO Number': '2263688', 'PO line': '1', 'PO Schedule Line': '15', 'Item Code': '9486-6387', 'PO Delivery Date': '10/02/2025', 'PO Open Qty': '22', 'Buyer': 'Carlos', 'Buyer email': 'carlos@happyrobot.ai', 'supplier_email': 'steelforgeltd@example.com', 'Supplier': 'SteelForge Ltd', 'Supplier contact name': 'Jordan Parker', 'Status': 'Confirmed' }
        ];
        
        setPOData(demoData);
        setSupplierInsights([]);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const calculateSupplierMetrics = (supplier: string): SupplierMetrics => {
    const supplierData = supplierInsights.filter(row => row.Supplier === supplier);
    
    if (supplierData.length === 0) {
      return {
        avgResponseTime: 0,
        escalationRate: 0,
        onTimeDeliveries: 0,
        delayRate: 0,
        riskScore: 0,
        totalOrders: 0
      };
    }
    
    // Calculate metrics for display
    const avgResponseTime = Math.round(
      supplierData.reduce((sum, row) => sum + parseInt(row['Response Time (hrs)']), 0) / supplierData.length
    );
    
    const escalationRate = Math.round(
      (supplierData.filter(row => row['Phone Escalation'] === 'True').length / supplierData.length) * 100
    );
    
    const onTimeDeliveries = Math.round(
      (supplierData.filter(row => !['Delayed', 'Incomplete'].includes(row['Delivery Status'])).length / supplierData.length) * 100
    );
    
    const delayRate = Math.round(
      (supplierData.filter(row => ['Delayed', 'Incomplete'].includes(row['Delivery Status'])).length / supplierData.length) * 100
    );
    
    // New Risk Score Calculation with more aggressive values
    let totalRisk = 0;
    
    supplierData.forEach(row => {
      let orderRisk = 0;
      
      // Base risk by delivery status (increased base values)
      const status = row['Delivery Status'];
      if (status === 'Delivered') {
        orderRisk = 10; // Reduced from 15 to give more range
      } else if (status === 'Delayed') {
        orderRisk = 70; // Increased from 65
      } else if (status === 'Incomplete') {
        orderRisk = 90; // Increased from 80
      }
      
      // Escalation penalty: +15 if phone escalation occurred
      if (row['Phone Escalation'] === 'True') {
        orderRisk += 15;
      }
      
      // Response time penalty: normalize between 12h (good) and 72h (bad)
      const responseHours = parseInt(row['Response Time (hrs)']);
      let responseTimePenalty = 0;
      
      if (responseHours <= 12) {
        responseTimePenalty = 0;
      } else if (responseHours >= 72) {
        responseTimePenalty = 20;
      } else {
        // Linear interpolation between 12h and 72h
        responseTimePenalty = ((responseHours - 12) / (72 - 12)) * 20;
      }
      
      orderRisk += responseTimePenalty;
      
      // Clamp to 0-100
      orderRisk = Math.max(0, Math.min(100, orderRisk));
      
      totalRisk += orderRisk;
    });
    
    // Average risk across all orders
    const riskScore = Math.round(totalRisk / supplierData.length);
    
    return {
      avgResponseTime,
      escalationRate,
      onTimeDeliveries,
      delayRate,
      riskScore,
      totalOrders: supplierData.length
    };
  };
  
  const calculateContactMetrics = (supplier: string, contact: string) => {
    const contactData = supplierInsights.filter(
      row => row.Supplier === supplier && row['Supplier contact'] === contact
    );
    
    if (contactData.length === 0) return null;
    
    const avgResponseTime = Math.round(
      contactData.reduce((sum, row) => sum + parseInt(row['Response Time (hrs)']), 0) / contactData.length
    );
    
    const escalationRate = Math.round(
      (contactData.filter(row => row['Phone Escalation'] === 'True').length / contactData.length) * 100
    );
    
    const onTimeRate = Math.round(
      (contactData.filter(row => !['Delayed', 'Incomplete'].includes(row['Delivery Status'])).length / contactData.length) * 100
    );
    
    // Calculate risk score for this contact using same logic
    let totalRisk = 0;
    
    contactData.forEach(row => {
      let orderRisk = 0;
      
      const status = row['Delivery Status'];
      if (status === 'Delivered') {
        orderRisk = 15;
      } else if (status === 'Delayed') {
        orderRisk = 65;
      } else if (status === 'Incomplete') {
        orderRisk = 80;
      }
      
      if (row['Phone Escalation'] === 'True') {
        orderRisk += 15;
      }
      
      const responseHours = parseInt(row['Response Time (hrs)']);
      let responseTimePenalty = 0;
      
      if (responseHours <= 12) {
        responseTimePenalty = 0;
      } else if (responseHours >= 72) {
        responseTimePenalty = 20;
      } else {
        responseTimePenalty = ((responseHours - 12) / (72 - 12)) * 20;
      }
      
      orderRisk += responseTimePenalty;
      orderRisk = Math.max(0, Math.min(100, orderRisk));
      totalRisk += orderRisk;
    });
    
    const riskScore = Math.round(totalRisk / contactData.length);
    
    return {
      avgResponseTime,
      escalationRate,
      onTimeRate,
      totalOrders: contactData.length,
      riskScore
    };
  };
  
  const getRiskLevel = (score: number): { label: string; color: string } => {
    if (score >= 50) return { label: 'High Risk', color: 'text-red-600 bg-red-100' };
    if (score >= 35) return { label: 'Medium Risk', color: 'text-yellow-600 bg-yellow-100' };
    return { label: 'Low Risk', color: 'text-green-600 bg-green-100' };
  };

  const getStatusColor = (status: string, isThisWeek: boolean = false): string => {
    if (isThisWeek && !['Confirmed', 'Delivered'].includes(status)) {
      return 'bg-red-300';
    }
    
    const colors: Record<string, string> = {
      'Confirmed': 'bg-green-200',
      'Delivered': 'bg-green-200',
      'Delayed': 'bg-red-300',
      'At Risk': 'bg-red-300',
      'Phone Call': 'bg-gray-300',
      'Email Sent': 'bg-gray-300',
      'Pending': 'bg-gray-300',
      'On Way': 'bg-blue-200'
    };
    return colors[status] || 'bg-gray-300';
  };

  const getStatusBadge = (status: string, supplier: string = '', isConfirmedTab: boolean = false) => {
    const badges: Record<string, { bg: string; text: string; label: string; icon: any }> = {
      'Confirmed': { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmed', icon: CheckCircle },
      'Delivered': { bg: 'bg-green-100', text: 'text-green-800', label: 'Delivered', icon: Package },
      'Delayed': { bg: 'bg-red-100', text: 'text-red-800', label: 'Delayed', icon: AlertCircle },
      'At Risk': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'At Risk', icon: AlertCircle },
      'Phone Call': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Phone Call', icon: Phone },
      'Email Sent': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Email Sent', icon: Mail },
      'Pending': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Pending', icon: Clock },
      'On Way': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'On Way', icon: Truck }
    };
    
    const badge = badges[status] || badges['Pending'];
    const IconComponent = badge.icon;
    
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${badge.bg}`}>
        <IconComponent className={`w-4 h-4 ${badge.text}`} />
        <span className={`text-sm font-medium ${badge.text}`}>{badge.label}</span>
      </div>
    );
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDaysUntil = (dateStr: string): number => {
    if (!dateStr) return 0;
    const today = new Date('2025-10-03'); // Today is Oct 3
    const deliveryDate = new Date(dateStr);
    const diffTime = deliveryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Feature #3: Priority Indicators - only for 1-3 days out
  const getPriorityLevel = (po: POData): { level: 'overdue' | 'urgent' | 'soon' | 'normal'; color: string; label: string } | null => {
    const daysUntil = getDaysUntil(po['PO Delivery Date']);
    
    // Don't show priority for delivered items or items > 3 days out
    if (po.Status === 'Delivered' || daysUntil > 3 || daysUntil < 0) {
      return null;
    }
    
    if (daysUntil <= 1) {
      return { level: 'urgent', color: 'bg-red-500', label: `Due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}` };
    } else if (daysUntil <= 3) {
      return { level: 'soon', color: 'bg-orange-500', label: `Due in ${daysUntil} days` };
    }
    
    return null;
  };

  const getRiskLevelForPO = (po: POData): 'high' | 'medium' | 'low' => {
    const daysUntil = getDaysUntil(po['PO Delivery Date']);
    const isUnreliable = unreliableSuppliers.includes(po.Supplier);
    
    if (daysUntil < 0 || (daysUntil <= 1 && !['Confirmed', 'Delivered'].includes(po.Status))) {
      return 'high';
    } else if (daysUntil <= 3 || (isUnreliable && ['Confirmed', 'Delivered'].includes(po.Status))) {
      return 'medium';
    }
    return 'low';
  };

  const isThisWeek = (dateStr: string): boolean => {
    if (!dateStr) return false;
    
    // Define the current week boundaries
    const weekStart = new Date('2025-09-29'); // Monday Sept 29
    const weekEnd = new Date('2025-10-06');   // Sunday Oct 5
    weekEnd.setHours(23, 59, 59, 999); // Include the entire day
    
    // Parse the date - handle both MM/D/YYYY and MM/DD/YYYY formats
    const deliveryDate = new Date(dateStr);
    
    // Verify it's a valid date
    if (isNaN(deliveryDate.getTime())) {
      console.log('Invalid date:', dateStr);
      return false;
    }
    
    return deliveryDate >= weekStart && deliveryDate <= weekEnd;
  };

  const buyerData = poData.filter(po => po.Buyer === selectedBuyer);

  const thisWeekPOs = buyerData
    .filter(po => isThisWeek(po['PO Delivery Date']))
    .sort((a, b) => getDaysUntil(a['PO Delivery Date']) - getDaysUntil(b['PO Delivery Date']));

  const thisWeekPONumbers = new Set(thisWeekPOs.map(po => po['PO Number']));
  
  // Feature #2: Apply all filters
  const filteredPOs = buyerData.filter(po => {
    if (thisWeekPONumbers.has(po['PO Number'])) {
      return false;
    }
    
    // Status filter (pending/confirmed)
    if (activeFilter === 'pending') {
      // "On Way" should never be in Pending Confirmation
      if (['Confirmed', 'Delivered', 'On Way'].includes(po.Status)) return false;
    } else {
      if (!['Confirmed', 'Delivered', 'On Way'].includes(po.Status)) return false;
    }
    
    // Search filter only
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesPO = po['PO Number'].toLowerCase().includes(query);
      const matchesItem = po['Item Code'].toLowerCase().includes(query);
      const matchesSupplier = po.Supplier.toLowerCase().includes(query);
      if (!matchesPO && !matchesItem && !matchesSupplier) return false;
    }
    
    return true;
  });

  // Feature #5: Dashboard Metrics
  const dashboardMetrics = {
    actionRequiredToday: buyerData.filter(po => {
      const daysUntil = getDaysUntil(po['PO Delivery Date']);
      return daysUntil <= 1 && !['Confirmed', 'Delivered'].includes(po.Status);
    }).length,
    avgDaysToDelivery: Math.round(
      buyerData
        .filter(po => po.Status !== 'Delivered')
        .reduce((sum, po) => sum + Math.max(0, getDaysUntil(po['PO Delivery Date'])), 0) / 
        buyerData.filter(po => po.Status !== 'Delivered').length || 0
    ),
    overdueItems: buyerData.filter(po => getDaysUntil(po['PO Delivery Date']) < 0).length,
    activePOs: buyerData.filter(po => po.Status !== 'Delivered').length
  };

  const handleEmailSupplier = (po: POData) => {
    const subject = encodeURIComponent(`PO #${po['PO Number']} - Status Update Request`);
    const body = encodeURIComponent(`Dear ${po['Supplier contact name']},\n\nI hope this email finds you well. I'm reaching out regarding Purchase Order #${po['PO Number']} scheduled for delivery on ${formatDate(po['PO Delivery Date'])}.\n\nCould you please provide an update on the delivery status?\n\nThank you,\n${po.Buyer}`);
    window.location.href = `mailto:${po.supplier_email}?subject=${subject}&body=${body}`;
  };

  const handleUpdateStatus = (newStatus: string) => {
    const updatedData = poData.map(po => 
      po['PO Number'] === selectedPO?.['PO Number'] ? { ...po, Status: newStatus } : po
    );
    setPOData(updatedData);
    if (selectedPO) {
      setSelectedPO({ ...selectedPO, Status: newStatus });
    }
    setShowStatusUpdate(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F1E8' }}>
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F1E8' }}>
      <header className="border-b border-gray-300 bg-white bg-opacity-50">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <HappyRobotLogo />
              <h1 className="text-3xl font-serif mt-1">Supplier Command</h1>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex gap-8 text-sm font-medium">
                <button
                  onClick={() => setActiveView('PO MANAGEMENT')}
                  className={`${activeView === 'PO MANAGEMENT' ? 'text-black' : 'text-gray-500'} hover:text-black transition-colors`}
                >
                  PO MANAGEMENT
                </button>
                <button
                  onClick={() => setActiveView('SUPPLIER INFORMATION')}
                  className={`${activeView === 'SUPPLIER INFORMATION' ? 'text-black' : 'text-gray-500'} hover:text-black transition-colors`}
                >
                  SUPPLIER INSIGHTS
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">ACCOUNT</span>
                <select
                  value={selectedBuyer}
                  onChange={(e) => setSelectedBuyer(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                >
                  {[...new Set(poData.map(po => po.Buyer))].sort().map(buyer => (
                    <option key={buyer} value={buyer}>{buyer}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        {activeView === 'PO MANAGEMENT' && (
          <>
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-5xl font-serif mb-2">Hello, {selectedBuyer}.</h2>
                <p className="text-lg text-gray-700">This week's POs:</p>
              </div>

              {/* Feature #5: Dashboard Metrics - inline with greeting */}
              <div className="flex gap-3">
                <div className="bg-white rounded-lg p-4 border-2 border-gray-200 w-32">
                  <div className="text-xs text-gray-600 mb-1">Expected Today</div>
                  <div className="text-2xl font-bold text-blue-600">{dashboardMetrics.actionRequiredToday}</div>
                </div>
                <div className="bg-white rounded-lg p-4 border-2 border-gray-200 w-32">
                  <div className="text-xs text-gray-600 mb-1">Delayed</div>
                  <div className="text-2xl font-bold text-red-600">{buyerData.filter(po => po.Status === 'Delayed').length}</div>
                </div>
                <div className="bg-white rounded-lg p-4 border-2 border-gray-200 w-32">
                  <div className="text-xs text-gray-600 mb-1">Active</div>
                  <div className="text-2xl font-bold text-gray-900">{dashboardMetrics.activePOs}</div>
                </div>
              </div>
            </div>

            {thisWeekPOs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {thisWeekPOs.map((po, idx) => {
                  const priority = getPriorityLevel(po);
                  const isDelivered = po.Status === 'Delivered';
                  
                  // Check for risk indicators
                  const supplierRisk = getRiskLevelForPO(po);
                  const contactMetrics = calculateContactMetrics(po.Supplier, po['Supplier contact name']);
                  const hasHighEscalationContact = contactMetrics && contactMetrics.escalationRate >= 40;
                  const isUnreliableSupplier = supplierRisk === 'medium' || supplierRisk === 'high';
                  const hasRiskWarning = isUnreliableSupplier || hasHighEscalationContact;
                  
                  return (
                    <div
                      key={`${po['PO Number']}-${idx}`}
                      onClick={() => setSelectedPO(po)}
                      className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative ${
                        isDelivered ? 'opacity-60' : ''
                      }`}
                    >
                      {isDelivered && (
                        <div className="absolute inset-0 bg-green-100 opacity-20 rounded-2xl pointer-events-none"></div>
                      )}
                      {/* Feature #3: Priority Indicator Badge - only for 1-3 days */}
                      {priority && (
                        <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-white text-xs font-semibold ${priority.color}`}>
                          {priority.label}
                        </div>
                      )}
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold mb-1">PO #{po['PO Number']}</h3>
                        <p className="text-sm text-gray-600">Due {formatDate(po['PO Delivery Date'])}</p>
                        <p className="text-xs text-gray-500 mt-1">{po.Supplier}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getStatusBadge(po.Status, po.Supplier, false)}
                        {hasRiskWarning && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-100">
                            <AlertCircle className="w-4 h-4 text-yellow-800" />
                            <span className="text-sm font-medium text-yellow-800">At Risk</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 shadow-sm mb-12 text-center text-gray-500">
                No POs due this week
              </div>
            )}

            {/* Feature #2: Search Bar - inline with toggle */}
            <div className="flex items-center gap-4 mb-8">
              <div className="inline-flex rounded-full bg-white shadow-sm overflow-hidden">
                <button
                  onClick={() => setActiveFilter('pending')}
                  className={`px-8 py-3 text-sm font-medium transition-colors ${
                    activeFilter === 'pending'
                      ? 'bg-gray-400 text-black'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Pending Confirmation
                  </button>
                  <button
                    onClick={() => setActiveFilter('confirmed')}
                    className={`px-8 py-3 text-sm font-medium transition-colors ${
                      activeFilter === 'confirmed'
                        ? 'bg-gray-400 text-black'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Confirmed
                  </button>
                </div>
                
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search PO, Item, Supplier..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-black transition-colors bg-white"
                  />
                </div>
              </div>
  
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPOs.sort((a, b) => getDaysUntil(a['PO Delivery Date']) - getDaysUntil(b['PO Delivery Date'])).map((po, idx) => {
                  const priority = getPriorityLevel(po);
                  const isDelivered = po.Status === 'Delivered';
                  
                  // Check for risk indicators
                  const supplierRisk = getRiskLevelForPO(po);
                  const contactMetrics = calculateContactMetrics(po.Supplier, po['Supplier contact name']);
                  const hasHighEscalationContact = contactMetrics && contactMetrics.escalationRate >= 40;
                  const isUnreliableSupplier = supplierRisk === 'medium' || supplierRisk === 'high';
                  const hasRiskWarning = isUnreliableSupplier || hasHighEscalationContact;
                  
                  return (
                    <div
                      key={`${po['PO Number']}-${idx}`}
                      onClick={() => setSelectedPO(po)}
                      className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative ${
                        isDelivered ? 'opacity-60' : ''
                      }`}
                    >
                      {isDelivered && (
                        <div className="absolute inset-0 bg-green-100 opacity-30 rounded-2xl pointer-events-none"></div>
                      )}
                      {/* Feature #3: Priority Indicator Badge - only for 1-3 days */}
                      {priority && (
                        <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-white text-xs font-semibold ${priority.color}`}>
                          {priority.label}
                        </div>
                      )}
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold mb-1">PO #{po['PO Number']}</h3>
                        <p className="text-sm text-gray-600">Due {formatDate(po['PO Delivery Date'])}</p>
                        <p className="text-xs text-gray-500 mt-1">{po.Supplier}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getStatusBadge(po.Status, po.Supplier, activeFilter === 'confirmed')}
                        {hasRiskWarning && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-100">
                            <AlertCircle className="w-4 h-4 text-yellow-800" />
                            <span className="text-sm font-medium text-yellow-800">At Risk</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
  
  {activeView === 'SUPPLIER INFORMATION' && (
  <div>
    <div className="flex items-center justify-between mb-8">
      <h2 className="text-3xl font-serif">Supplier Performance</h2>
      <select
        value={selectedSupplierFilter}
        onChange={(e) => setSelectedSupplierFilter(e.target.value)}
        className="px-6 py-3 bg-white border-2 border-gray-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
      >
        <option value="all">All Suppliers</option>
        {[...new Set(supplierInsights.map(s => s.Supplier))].sort().map(supplier => (
          <option key={supplier} value={supplier}>{supplier}</option>
        ))}
      </select>
    </div>

    {/* All Suppliers View - Donut Chart Cards */}
    {selectedSupplierFilter === 'all' && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...new Set(supplierInsights.map(s => s.Supplier))].sort().map(supplier => {
          const metrics = calculateSupplierMetrics(supplier);
          const risk = getRiskLevel(metrics.riskScore);
          
          return (
            <div 
              key={supplier} 
              onClick={() => setSelectedSupplierFilter(supplier)}
              className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-gray-400 transition-all cursor-pointer"
            >
              {/* Circular Risk Score */}
              <div className="relative w-40 h-40 mx-auto mb-6">
                <svg className="transform -rotate-90 w-40 h-40">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#E5E7EB"
                    strokeWidth="16"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke={metrics.riskScore >= 50 ? '#EF4444' : metrics.riskScore >= 35 ? '#F59E0B' : '#10B981'}
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray={`${(metrics.riskScore / 100) * 439.8} 439.8`}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold text-gray-900">{metrics.riskScore}</div>
                  <div className="text-xs text-gray-500 mt-1">Risk Score</div>
                </div>
              </div>

              {/* Supplier Name */}
              <h3 className="text-lg font-semibold text-center mb-3">
                {supplier}
              </h3>
              
              {/* Risk Label */}
              <div className={`text-center px-4 py-2 rounded-full text-sm font-semibold mb-4 ${risk.color}`}>
                {risk.label}
              </div>

              {/* Key Stats */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">On-time</span>
                  <span className="font-semibold">{metrics.onTimeDeliveries}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Response</span>
                  <span className="font-semibold">{metrics.avgResponseTime}h</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}

    {/* Individual Supplier Dashboard */}
    {selectedSupplierFilter !== 'all' && (() => {
      const supplier = selectedSupplierFilter;
      const metrics = calculateSupplierMetrics(supplier);
      const risk = getRiskLevel(metrics.riskScore);
      const supplierPOs = buyerData.filter(po => po.Supplier === supplier);
      const contacts = [...new Set(supplierInsights.filter(s => s.Supplier === supplier).map(s => s['Supplier contact']))];
      
      // Calculate active POs and at-risk POs
      const activePOs = supplierPOs.filter(po => po.Status !== 'Delivered');
      const atRiskPOs = activePOs.filter(po => {
        const daysUntil = getDaysUntil(po['PO Delivery Date']);
        return daysUntil <= 7 && !['Confirmed', 'On Way'].includes(po.Status);
      });
      
      // Find high-escalation contacts
      const highEscalationContacts = contacts.filter(contact => {
        const contactMetrics = calculateContactMetrics(supplier, contact);
        return contactMetrics && contactMetrics.escalationRate >= 40;
      });
      
      return (
        <div className="space-y-6">
          {/* Header Card with Side-by-Side Layout */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
            <div className="flex items-start justify-between mb-6">
              <h3 className="text-3xl font-semibold">{supplier}</h3>
              <div className={`px-6 py-3 rounded-full font-semibold text-lg ${risk.color}`}>
                {risk.label}
              </div>
            </div>

            {/* Donut Chart + 2x2 Metrics Grid */}
            <div className="flex gap-8 items-center">
              {/* Donut Chart - Left Side */}
              <div className="relative w-48 h-48 flex-shrink-0">
                <svg className="transform -rotate-90 w-48 h-48">
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    stroke="#E5E7EB"
                    strokeWidth="20"
                    fill="none"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    stroke={metrics.riskScore >= 50 ? '#EF4444' : metrics.riskScore >= 35 ? '#F59E0B' : '#10B981'}
                    strokeWidth="20"
                    fill="none"
                    strokeDasharray={`${(metrics.riskScore / 100) * 502.4} 502.4`}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-5xl font-bold text-gray-900">{metrics.riskScore}</div>
                  <div className="text-sm text-gray-500 mt-1">Risk Score</div>
                </div>
              </div>

              {/* 2x2 Metrics Grid - Right Side */}
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="text-4xl font-bold text-gray-900 mb-2">{metrics.avgResponseTime}h</div>
                  <div className="text-sm text-gray-600">Avg Response</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="text-4xl font-bold text-green-600 mb-2">{metrics.onTimeDeliveries}%</div>
                  <div className="text-sm text-gray-600">On-time</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="text-4xl font-bold text-orange-600 mb-2">{metrics.escalationRate}%</div>
                  <div className="text-sm text-gray-600">Escalations</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="text-4xl font-bold text-red-600 mb-2">{metrics.delayRate}%</div>
                  <div className="text-sm text-gray-600">Delayed</div>
                </div>
              </div>
            </div>

            {/* Active POs Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-600">Active POs: </span>
                  <span className="font-semibold">{activePOs.length} order{activePOs.length !== 1 ? 's' : ''}</span>
                  {atRiskPOs.length > 0 && (
                    <span className="text-red-600 ml-2">({atRiskPOs.length} at risk)</span>
                  )}
                </div>
                <button 
                  onClick={() => {
                    setActiveView('PO MANAGEMENT');
                    setSearchQuery(supplier);
                  }}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  View All POs →
                </button>
              </div>
            </div>
          </div>

          {/* Active Risks Alert Panel */}
          {(atRiskPOs.length > 0 || highEscalationContacts.length > 0 || metrics.avgResponseTime > 24) && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
              <h4 className="font-semibold text-amber-900 mb-4 flex items-center gap-2 text-lg">
                <AlertCircle className="w-5 h-5" />
                Active Risks
              </h4>
              <div className="space-y-3">
                {atRiskPOs.length > 0 && (
                  <div className="flex items-start gap-3 bg-white rounded-lg p-4">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="font-medium text-amber-900 mb-1">
                        {atRiskPOs.length} PO{atRiskPOs.length !== 1 ? 's' : ''} at risk
                      </div>
                      <div className="text-sm text-amber-800">
                        Due within a week without confirmation
                      </div>
                    </div>
                  </div>
                )}
                {highEscalationContacts.length > 0 && (
                  <div className="flex items-start gap-3 bg-white rounded-lg p-4">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="font-medium text-amber-900 mb-1">
                        High escalation contacts detected
                      </div>
                      <div className="text-sm text-amber-800">
                        {highEscalationContacts.join(', ')} {highEscalationContacts.length === 1 ? 'has' : 'have'} &gt;40% escalation rate
                      </div>
                    </div>
                  </div>
                )}
                {metrics.avgResponseTime > 24 && (
                  <div className="flex items-start gap-3 bg-white rounded-lg p-4">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="font-medium text-amber-900 mb-1">
                        Slow response time
                      </div>
                      <div className="text-sm text-amber-800">
                        Average {metrics.avgResponseTime}h (threshold: 24h)
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Performance */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
            <h4 className="text-xl font-semibold mb-6">Contact Performance</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contacts.map(contact => {
                const contactMetrics = calculateContactMetrics(supplier, contact);
                if (!contactMetrics) return null;
                
                // Get the email for this contact - check buyerData first, then use supplier's email as fallback
                let contactEmail = buyerData.find(
                  po => po.Supplier === supplier && po['Supplier contact name'] === contact
                )?.['supplier_email'] || '';
                
                // If not found, use the supplier's general email
                if (!contactEmail) {
                  contactEmail = buyerData.find(po => po.Supplier === supplier)?.['supplier_email'] || '';
                }
                
                // Get active POs for this contact
                const contactPOs = supplierPOs.filter(po => po['Supplier contact name'] === contact && po.Status !== 'Delivered');
                
                // Check if high escalation
                const isHighEscalation = contactMetrics.escalationRate >= 40;
                
                return (
                  <div key={contact} className="border-2 border-gray-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-lg mb-1">{contact}</h5>
                        {contactEmail && <p className="text-sm text-gray-600 truncate">{contactEmail}</p>}
                      </div>
                      {isHighEscalation && (
                        <div className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full whitespace-nowrap ml-2">
                          ⚠️ High Escalation
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{contactMetrics.avgResponseTime}h</div>
                        <div className="text-xs text-gray-600">Response</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{contactMetrics.onTimeRate}%</div>
                        <div className="text-xs text-gray-600">On-time</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">{contactMetrics.escalationRate}%</div>
                        <div className="text-xs text-gray-600">Escalations</div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="space-y-3 pt-4 border-t border-gray-200">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            const po = supplierPOs.find(p => p['Supplier contact name'] === contact);
                            if (po) handleEmailSupplier(po);
                          }}
                          className="flex-1 px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-700 transition-colors"
                        >
                          Email
                        </button>
                        <button 
                          onClick={() => {
                            const po = supplierPOs.find(p => p['Supplier contact name'] === contact);
                            if (po) {
                              setSelectedPO(po);
                              setShowCallModal(true);
                            }
                          }}
                          className="flex-1 px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-700 transition-colors"
                        >
                          Call
                        </button>
                      </div>
                      
                      {/* Active POs for this contact */}
                      {contactPOs.length > 0 && (
                        <div className="text-xs text-gray-600">
                          Currently handling: {contactPOs.slice(0, 2).map((po, idx) => (
                            <span key={po['PO Number']}>
                              {idx > 0 && ', '}
                              <button 
                                onClick={() => setSelectedPO(po)}
                                className="text-blue-600 hover:underline"
                              >
                                PO #{po['PO Number']}
                              </button>
                            </span>
                          ))}
                          {contactPOs.length > 2 && <span className="text-gray-500"> +{contactPOs.length - 2} more</span>}
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        {contactMetrics.totalOrders} total orders
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    })()}
  </div>
)}
        </main>
  
        {selectedPO && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-auto shadow-xl">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-8 flex items-start justify-between rounded-t-2xl">
                <div>
                  <h2 className="text-3xl font-serif mb-2">PO #{selectedPO['PO Number']}</h2>
                  <p className="text-gray-600">Due {formatDate(selectedPO['PO Delivery Date'])}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {getDaysUntil(selectedPO['PO Delivery Date'])} days away
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPO(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-light leading-none"
                >
                  ×
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div>
                  {getStatusBadge(selectedPO.Status, selectedPO.Supplier, ['Confirmed', 'Delivered', 'On Way'].includes(selectedPO.Status))}
                  {(() => {
                    const supplierRisk = getRiskLevelForPO(selectedPO);
                    const contactMetrics = calculateContactMetrics(selectedPO.Supplier, selectedPO['Supplier contact name']);
                    const hasHighEscalationContact = contactMetrics && contactMetrics.escalationRate >= 40;
                    const isUnreliableSupplier = supplierRisk === 'medium' || supplierRisk === 'high';
                    
                    if (isUnreliableSupplier || hasHighEscalationContact) {
                      return (
                        <div className="mt-2 text-sm text-yellow-700">
                          {isUnreliableSupplier && hasHighEscalationContact && (
                            <span><span className="font-medium">⚠️ Unreliable Supplier & High Escalation Contact:</span> This supplier has a history of delayed deliveries and the contact has a high escalation rate.</span>
                          )}
                          {isUnreliableSupplier && !hasHighEscalationContact && (
                            <span><span className="font-medium">⚠️ Unreliable Supplier:</span> This supplier has a history of delayed deliveries.</span>
                          )}
                          {!isUnreliableSupplier && hasHighEscalationContact && (
                            <span><span className="font-medium">⚠️ High Escalation Contact:</span> {selectedPO['Supplier contact name']} has a high escalation rate ({contactMetrics?.escalationRate}%).</span>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
  
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Supplier</h3>
                  <div className="space-y-2">
                    <p className="text-lg font-medium">{selectedPO.Supplier}</p>
                    <p className="text-gray-700">{selectedPO['Supplier contact name']}</p>
                    <p className="text-gray-600 text-sm">{selectedPO.supplier_email}</p>
                  </div>
                </div>
  
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Order Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Item Code</p>
                      <p className="font-medium">{selectedPO['Item Code']}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Quantity</p>
                      <p className="font-medium">{selectedPO['PO Open Qty']} units</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">PO Line</p>
                      <p className="font-medium">{selectedPO['PO line']}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Schedule Line</p>
                      <p className="font-medium">{selectedPO['PO Schedule Line']}</p>
                    </div>
                  </div>
                </div>
  
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Communication History</h3>
                  
                  {selectedPO.Status === 'Pending' && (
                    <div className="text-sm text-gray-500 italic">
                      No communication history - no email or phone call has been sent yet.
                    </div>
                  )}
  
                  {selectedPO.Status === 'Email Sent' && (
                    <div className="space-y-3">
                      <div className="border-l-4 border-gray-300 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Email</span>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-xs font-semibold">P</div>
                            <span className="font-semibold text-sm">Paul</span>
                          </div>
                          <p className="text-sm text-gray-800">
                            Sent email for PO #{selectedPO['PO Number']} requesting update.
                          </p>
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 text-sm">
                        <span className="font-medium text-blue-800">ℹ️ Awaiting Response:</span> <span className="text-blue-700">Will escalate to phone call if no response within 72 hours.</span>
                      </div>
                    </div>
                  )}
  
                  {selectedPO.Status === 'Phone Call' && (
                    <div className="space-y-3">
                      <div className="border-l-4 border-gray-300 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Email</span>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-xs font-semibold">P</div>
                            <span className="font-semibold text-sm">Paul</span>
                          </div>
                          <p className="text-sm text-gray-800">
                            Sent email for PO #{selectedPO['PO Number']} requesting update.
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-orange-50 border border-orange-300 rounded-lg p-3 text-sm">
                        <span className="font-medium text-orange-800">⏱️ No Response:</span> <span className="text-orange-700">72 hours elapsed. Escalating to phone call.</span>
                      </div>
  
                      <div className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Phone className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-blue-700">Phone Call Initiated</span>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-xs font-semibold">P</div>
                            <span className="font-semibold text-sm">Paul</span>
                          </div>
                          <p className="text-sm text-gray-800">
                            Calling {selectedPO['Supplier contact name']} at {selectedPO.Supplier}...
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
  
                  {(selectedPO.Status === 'Confirmed' || selectedPO.Status === 'Delivered') && (
                    <div className="space-y-3">
                      <div className="border-l-4 border-gray-300 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Email</span>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-xs font-semibold">P</div>
                            <span className="font-semibold text-sm">Paul</span>
                          </div>
                          <p className="text-sm text-gray-800">
                            Sent email for PO #{selectedPO['PO Number']} requesting update.
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-orange-50 border border-orange-300 rounded-lg p-3 text-sm">
                        <span className="font-medium text-orange-800">⏱️ No Response:</span> <span className="text-orange-700">72 hours elapsed. Escalating to phone call.</span>
                      </div>
  
                      <div className="border-l-4 border-gray-300 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Phone Call</span>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-xs font-semibold">
                              {selectedPO.Supplier.charAt(0)}
                            </div>
                            <span className="font-semibold text-sm">{selectedPO['Supplier contact name']}</span>
                          </div>
                          <p className="text-sm text-gray-800">
                            Confirmed delivery for {formatDate(selectedPO['PO Delivery Date'])}, Tracking #98ABC34.
                          </p>
                        </div>
                      </div>
  
                      <div className="border-l-4 border-green-500 pl-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-semibold text-green-700">Confirmed Status</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedPO.Status === 'Delayed' && (
                    <div className="space-y-3">
                      <div className="border-l-4 border-gray-300 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Email</span>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-xs font-semibold">P</div>
                            <span className="font-semibold text-sm">Paul</span>
                          </div>
                          <p className="text-sm text-gray-800">
                            Sent email for PO #{selectedPO['PO Number']} requesting update.
                          </p>
                        </div>
                      </div>
                      
                      <div className="border-l-4 border-red-500 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Phone className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium text-red-700">Delay Notification</span>
                        </div>
                        <div className="bg-red-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-xs font-semibold">
                              {selectedPO.Supplier.charAt(0)}
                            </div>
                            <span className="font-semibold text-sm">{selectedPO['Supplier contact name']}</span>
                          </div>
                          <p className="text-sm text-gray-800">
                            Supplier indicated shipment will be delayed. Originally scheduled for {formatDate(selectedPO['PO Delivery Date'])}, new ETA to be provided.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
  
                  {selectedPO.Status === 'At Risk' && (
                    <div className="space-y-3">
                      <div className="border-l-4 border-gray-300 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Email</span>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-xs font-semibold">P</div>
                            <span className="font-semibold text-sm">Paul</span>
                          </div>
                          <p className="text-sm text-gray-800">
                            Sent email for PO #{selectedPO['PO Number']} requesting update.
                          </p>
                        </div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                        <span className="font-medium">⚠️ Action Required:</span> No response received. Immediate follow-up needed.
                      </div>
                    </div>
                  )}
  
                  {selectedPO.Status === 'On Way' && (
                    <div className="space-y-3">
                      <div className="border-l-4 border-gray-300 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Email</span>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-xs font-semibold">
                              {selectedPO.Supplier.charAt(0)}
                            </div>
                            <span className="font-semibold text-sm">{selectedPO.Supplier}</span>
                          </div>
                          <p className="text-sm text-gray-800">
                            Shipment confirmed. Order is on the way. Expected delivery: {formatDate(selectedPO['PO Delivery Date'])}.
                          </p>
                        </div>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center gap-2">
                          <Truck className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-semibold text-blue-700">In Transit</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
  
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => handleEmailSupplier(selectedPO)}
                    className="flex-1 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-700 transition-colors font-medium"
                  >
                    Email Supplier
                  </button>
                  <button 
                    onClick={() => setShowCallModal(true)}
                    className="flex-1 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-700 transition-colors font-medium"
                  >
                    Call Supplier
                  </button>
                  <button 
                    onClick={() => setShowStatusUpdate(true)}
                    className="flex-1 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-700 transition-colors font-medium"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
  
        {showCallModal && selectedPO && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">Initiating Call</h3>
                  <p className="text-gray-600">Calling {selectedPO['Supplier contact name']} at {selectedPO.Supplier}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Contact:</span>
                    <span className="text-sm font-medium">{selectedPO['Supplier contact name']}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">PO Number:</span>
                    <span className="text-sm font-medium">#{selectedPO['PO Number']}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Due Date:</span>
                    <span className="text-sm font-medium">{formatDate(selectedPO['PO Delivery Date'])}</span>
                  </div>
                </div>
  
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Connecting to AI agent Paul...</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Dialing supplier...</span>
                  </div>
                </div>
  
                <button
                  onClick={() => setShowCallModal(false)}
                  className="w-full mt-6 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel Call
                </button>
              </div>
            </div>
          </div>
        )}
  
        {showStatusUpdate && selectedPO && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold">Update Status</h3>
                  <button
                    onClick={() => setShowStatusUpdate(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
  
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Pending Confirmation</h4>
                    <div className="space-y-2">
                      {['Email Sent', 'Phone Call', 'Pending'].map(status => (
                        <button
                          key={status}
                          onClick={() => handleUpdateStatus(status)}
                          className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                            selectedPO.Status === status
                              ? 'border-black bg-gray-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{status}</span>
                            {selectedPO.Status === status && (
                              <CheckCircle className="w-5 h-5 text-black" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Confirmed</h4>
                    <div className="space-y-2">
                      {['Confirmed', 'Delayed', 'At Risk', 'On Way', 'Delivered'].map(status => (
                        <button
                          key={status}
                          onClick={() => handleUpdateStatus(status)}
                          className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                            selectedPO.Status === status
                              ? 'border-black bg-gray-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{status}</span>
                            {selectedPO.Status === status && (
                              <CheckCircle className="w-5 h-5 text-black" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default SupplierCommand;