import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Phone, Mail, Clock, Truck, Package, X } from 'lucide-react';

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
    <div className="flex gap-0.5">
      <div className="w-3 h-3 bg-black rounded-sm"></div>
      <div className="w-3 h-3 bg-black rounded-sm"></div>
    </div>
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
    
    // Avg Response Time
    const avgResponseTime = Math.round(
      supplierData.reduce((sum, row) => sum + parseInt(row['Response Time (hrs)']), 0) / supplierData.length
    );
    
    // Escalation Rate (phone calls)
    const escalationRate = Math.round(
      (supplierData.filter(row => row['Phone Escalation'] === 'True').length / supplierData.length) * 100
    );
    
    // On-time deliveries (not Delayed or Incomplete)
    const onTimeDeliveries = Math.round(
      (supplierData.filter(row => !['Delayed', 'Incomplete'].includes(row['Delivery Status'])).length / supplierData.length) * 100
    );
    
    // Delay Rate
    const delayRate = Math.round(
      (supplierData.filter(row => ['Delayed', 'Incomplete'].includes(row['Delivery Status'])).length / supplierData.length) * 100
    );
    
    // Risk Score (0-100)
    const responseRisk = Math.min((avgResponseTime / 48) * 35, 35); // 48hrs baseline
    const escalationRisk = (escalationRate / 100) * 35;
    const delayRisk = (delayRate / 100) * 30;
    const riskScore = Math.round(responseRisk + escalationRisk + delayRisk);
    
    return {
      avgResponseTime,
      escalationRate,
      onTimeDeliveries,
      delayRate,
      riskScore,
      totalOrders: supplierData.length
    };
  };

  
  const getRiskLevel = (score: number): { label: string; color: string } => {
    if (score >= 70) return { label: 'High Risk', color: 'text-red-600 bg-red-100' };
    if (score >= 40) return { label: 'Medium Risk', color: 'text-yellow-600 bg-yellow-100' };
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
    const isUnreliable = unreliableSuppliers.includes(supplier);
    
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
    
    const canShowAtRisk = ['Confirmed', 'Email Sent', 'Phone Call', 'Pending'].includes(status);
    
    return (
      <div className="flex flex-wrap gap-2">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${badge.bg}`}>
          <IconComponent className={`w-4 h-4 ${badge.text}`} />
          <span className={`text-sm font-medium ${badge.text}`}>{badge.label}</span>
        </div>
        {isConfirmedTab && isUnreliable && canShowAtRisk && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-100">
            <AlertCircle className="w-4 h-4 text-yellow-800" />
            <span className="text-sm font-medium text-yellow-800">At Risk</span>
          </div>
        )}
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

  const isThisWeek = (dateStr: string): boolean => {
    if (!dateStr) return false;
    
    // Define the current week boundaries
    const weekStart = new Date('2025-09-29'); // Monday Sept 29
    const weekEnd = new Date('2025-10-05');   // Sunday Oct 5
    weekEnd.setHours(23, 59, 59, 999); // Include the entire day
    
    const deliveryDate = new Date(dateStr);
    
    return deliveryDate >= weekStart && deliveryDate <= weekEnd;
  };

  const buyerData = poData.filter(po => po.Buyer === selectedBuyer);

  const thisWeekPOs = buyerData
    .filter(po => isThisWeek(po['PO Delivery Date']))
    .sort((a, b) => getDaysUntil(a['PO Delivery Date']) - getDaysUntil(b['PO Delivery Date']))
    .slice(0, 3);

  const thisWeekPONumbers = new Set(thisWeekPOs.map(po => po['PO Number']));
  
  const filteredPOs = buyerData.filter(po => {
    if (thisWeekPONumbers.has(po['PO Number'])) {
      return false;
    }
    
    if (activeFilter === 'pending') {
      return !['Confirmed', 'Delivered'].includes(po.Status);
    } else {
      return ['Confirmed', 'Delivered', 'On Way'].includes(po.Status);
    }
  });

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
                  SUPPLIER INFORMATION
                </button>
              </div>
              <select
                value={selectedBuyer}
                onChange={(e) => setSelectedBuyer(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
              >
                {[...new Set(poData.map(po => po.Buyer))].sort().map(buyer => (
                  <option key={buyer} value={buyer}>{buyer}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        {activeView === 'PO MANAGEMENT' && (
          <>
            <div className="mb-8">
              <h2 className="text-5xl font-serif mb-2">Hello, {selectedBuyer}.</h2>
              <p className="text-lg text-gray-700">This week's POs:</p>
            </div>

            {thisWeekPOs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {thisWeekPOs.map((po, idx) => {
                  const isAtRisk = !['Confirmed', 'Delivered'].includes(po.Status);
                  return (
                    <div
                      key={`${po['PO Number']}-${idx}`}
                      onClick={() => setSelectedPO(po)}
                      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
                    >
                      <div className={`absolute top-6 right-6 w-6 h-6 rounded-full ${getStatusColor(po.Status, true)}`}></div>
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold mb-1">PO #{po['PO Number']}</h3>
                        <p className="text-sm text-gray-600">Due {formatDate(po['PO Delivery Date'])}</p>
                      </div>
                      {isAtRisk ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100">
                          <AlertCircle className="w-4 h-4 text-red-800" />
                          <span className="text-sm font-medium text-red-800">At Risk</span>
                        </div>
                      ) : (
                        getStatusBadge(po.Status, po.Supplier, false)
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 shadow-sm mb-12 text-center text-gray-500">
                No POs due this week
              </div>
            )}

            <div className="flex justify-start mb-8">
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
              </div>
  
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPOs.map((po, idx) => (
                  <div
                    key={`${po['PO Number']}-${idx}`}
                    onClick={() => setSelectedPO(po)}
                    className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold mb-1">PO #{po['PO Number']}</h3>
                      <p className="text-sm text-gray-600">Due {formatDate(po['PO Delivery Date'])}</p>
                      <p className="text-xs text-gray-500 mt-1">{po.Supplier}</p>
                    </div>
                    {getStatusBadge(po.Status, po.Supplier, activeFilter === 'confirmed')}
                  </div>
                ))}
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
        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
      >
        <option value="all">All Suppliers</option>
        {[...new Set(supplierInsights.map(s => s.Supplier))].sort().map(supplier => (
          <option key={supplier} value={supplier}>{supplier}</option>
        ))}
      </select>
    </div>

    <div className="grid grid-cols-1 gap-8">
      {([...new Set(supplierInsights.map(s => s.Supplier))].sort()
        .filter(supplier => selectedSupplierFilter === 'all' || supplier === selectedSupplierFilter)
        .map(supplier => {
          const metrics = calculateSupplierMetrics(supplier);
          const risk = getRiskLevel(metrics.riskScore);
          const supplierPOs = buyerData.filter(po => po.Supplier === supplier);
          const contact = supplierPOs[0]?.['Supplier contact name'] || 'N/A';
          const email = supplierPOs[0]?.['supplier_email'] || 'N/A';
          
          return (
            <div key={supplier} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gray-50 p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold mb-2">{supplier}</h3>
                    <p className="text-gray-600">{contact}</p>
                    <p className="text-sm text-gray-500">{email}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full font-semibold ${risk.color}`}>
                    {risk.label}
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-6">
                  {/* Avg Response Time */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {metrics.avgResponseTime}h
                    </div>
                    <div className="text-sm text-gray-600">Avg Response Time</div>
                  </div>

                  {/* Escalation Rate */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {metrics.escalationRate}%
                    </div>
                    <div className="text-sm text-gray-600">Escalation Rate</div>
                  </div>

                  {/* On-time Deliveries */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {metrics.onTimeDeliveries}%
                    </div>
                    <div className="text-sm text-gray-600">On-time Deliveries</div>
                  </div>

                  {/* Delay Rate */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 mb-1">
                      {metrics.delayRate}%
                    </div>
                    <div className="text-sm text-gray-600">Delay Rate</div>
                  </div>

                  {/* Risk Score */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {metrics.riskScore}
                    </div>
                    <div className="text-sm text-gray-600">Risk Score</div>
                    <div className="text-xs text-gray-500 mt-1">(0-100)</div>
                  </div>
                </div>

                {/* Visual Indicators */}
                <div className="space-y-4">
                  {/* Response Time Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Response Time</span>
                      <span className="text-sm text-gray-600">{metrics.avgResponseTime} hrs</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${metrics.avgResponseTime > 30 ? 'bg-red-500' : metrics.avgResponseTime > 20 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min((metrics.avgResponseTime / 48) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* On-time Delivery Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">On-time Performance</span>
                      <span className="text-sm text-gray-600">{metrics.onTimeDeliveries}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${metrics.onTimeDeliveries}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Risk Score Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Risk Level</span>
                      <span className="text-sm text-gray-600">{metrics.riskScore}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${metrics.riskScore >= 70 ? 'bg-red-500' : metrics.riskScore >= 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${metrics.riskScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Historical Orders */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Based on {metrics.totalOrders} historical orders
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
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
                  {unreliableSuppliers.includes(selectedPO.Supplier) && ['Confirmed', 'Delivered', 'On Way'].includes(selectedPO.Status) && (
                    <div className="mt-2 text-sm text-yellow-700">
                      <span className="font-medium">⚠️ Unreliable Supplier:</span> This supplier has a history of delayed deliveries.
                    </div>
                  )}
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
  
                  {isThisWeek(selectedPO['PO Delivery Date']) && !['Confirmed', 'Delivered'].includes(selectedPO.Status) && selectedPO.Status !== 'Pending' && (
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
                      <div className="bg-red-50 border border-red-300 rounded-lg p-3 text-sm">
                        <span className="font-medium text-red-800">⚠️ Escalation Required:</span> <span className="text-red-700">Due date is within 1 week. A phone call must be scheduled.</span>
                      </div>
                    </div>
                  )}
  
                  {selectedPO.Status === 'Email Sent' && !isThisWeek(selectedPO['PO Delivery Date']) && (
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
                            <span className="font-semibold text-sm">{selectedPO.Supplier}</span>
                          </div>
                          <p className="text-sm text-gray-800">
                            Confirmed delivery for {formatDate(selectedPO['PO Delivery Date'])}, Tracking #98ABC34.
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
  
                      <div className="border-l-4 border-gray-300 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Phone Call</span>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-4 mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-xs font-semibold">P</div>
                            <span className="font-semibold text-sm">Paul</span>
                          </div>
                          <p className="text-sm text-gray-800">
                            Initiating call with {selectedPO.Supplier}...
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-xs font-semibold">
                              {selectedPO.Supplier.charAt(0)}
                            </div>
                            <span className="font-semibold text-sm">{selectedPO.Supplier}</span>
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
  
                  {(selectedPO.Status === 'At Risk' || selectedPO.Status === 'Delayed') && (
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
                    className="flex-1 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                  >
                    Email Supplier
                  </button>
                  <button 
                    onClick={() => setShowCallModal(true)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Call Supplier
                  </button>
                  <button 
                    onClick={() => setShowStatusUpdate(true)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
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