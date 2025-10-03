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
        const response = await fetch('/suppliercommanddata.csv');
        const fileContent = await response.text();
        
        const lines = fileContent.split(/\r?\n/).filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        
        const data: POData[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const values = line.split(',').map(v => v.trim());
          
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          if (row['PO Number']) {
            data.push(row as POData);
          }
        }
        
        console.log('Successfully loaded', data.length, 'PO records from CSV');
        setPOData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading CSV file:', error);
        
        const demoData: POData[] = [
          { 'PO Number': '8394266', 'PO line': '1', 'PO Schedule Line': '1', 'Item Code': '2914-1122', 'PO Delivery Date': '09/30/2025', 'PO Open Qty': '3', 'Buyer': 'Carlos', 'Buyer email': 'carlos@happyrobot.ai', 'supplier_email': 'aerocraft1@example.com', 'Supplier': 'AeroCraft Tooling Co', 'Supplier contact name': 'Miles Ortega', 'Status': 'Delivered' },
          { 'PO Number': '4973008', 'PO line': '1', 'PO Schedule Line': '1', 'Item Code': '1259-6670', 'PO Delivery Date': '10/01/2025', 'PO Open Qty': '42', 'Buyer': 'John', 'Buyer email': 'john@happyrobot.ai', 'supplier_email': 'aerocrafttoolingco@example.com', 'Supplier': 'AeroCraft Tooling Co', 'Supplier contact name': 'Federico Ramos', 'Status': 'Confirmed' },
          { 'PO Number': '2531545', 'PO line': '2', 'PO Schedule Line': '12', 'Item Code': '2874-1239', 'PO Delivery Date': '11/07/2025', 'PO Open Qty': '33', 'Buyer': 'Nikhil', 'Buyer email': 'nikhil@happyrobot.ai', 'supplier_email': 'steelforgeltd@example.com', 'Supplier': 'SteelForge Ltd', 'Supplier contact name': 'Jordan Parker', 'Status': 'Delayed' },
          { 'PO Number': '8816480', 'PO line': '1', 'PO Schedule Line': '10', 'Item Code': '2457-9438', 'PO Delivery Date': '10/30/2025', 'PO Open Qty': '38', 'Buyer': 'Federico', 'Buyer email': 'federico@happyrobot.ai', 'supplier_email': 'aerocrafttoolingco@example.com', 'Supplier': 'AeroCraft Tooling Co', 'Supplier contact name': 'Miles Ortega', 'Status': 'Confirmed' },
          { 'PO Number': '9070451', 'PO line': '3', 'PO Schedule Line': '5', 'Item Code': '5082-4277', 'PO Delivery Date': '10/01/2025', 'PO Open Qty': '30', 'Buyer': 'John', 'Buyer email': 'john@happyrobot.ai', 'supplier_email': 'aerocrafttoolingco@example.com', 'Supplier': 'AeroCraft Tooling Co', 'Supplier contact name': 'Federico Ramos', 'Status': 'Delayed' },
          { 'PO Number': '2263688', 'PO line': '1', 'PO Schedule Line': '15', 'Item Code': '9486-6387', 'PO Delivery Date': '10/02/2025', 'PO Open Qty': '22', 'Buyer': 'Carlos', 'Buyer email': 'carlos@happyrobot.ai', 'supplier_email': 'steelforgeltd@example.com', 'Supplier': 'SteelForge Ltd', 'Supplier contact name': 'Jordan Parker', 'Status': 'Confirmed' },
          { 'PO Number': '1664203', 'PO line': '2', 'PO Schedule Line': '8', 'Item Code': '7441-2093', 'PO Delivery Date': '10/06/2025', 'PO Open Qty': '15', 'Buyer': 'Denise', 'Buyer email': 'denise@happyrobot.ai', 'supplier_email': 'mechasuppliesinc@example.com', 'Supplier': 'MechaSupplies Inc', 'Supplier contact name': 'Alex Chen', 'Status': 'Phone Call' },
          { 'PO Number': '1688919', 'PO line': '1', 'PO Schedule Line': '3', 'Item Code': '3892-5517', 'PO Delivery Date': '10/08/2025', 'PO Open Qty': '28', 'Buyer': 'Carlos', 'Buyer email': 'carlos@happyrobot.ai', 'supplier_email': 'skyworksparts@example.com', 'Supplier': 'SkyWorks Parts', 'Supplier contact name': 'Sarah Kim', 'Status': 'On Way' },
          { 'PO Number': '2020468', 'PO line': '3', 'PO Schedule Line': '6', 'Item Code': '1648-3729', 'PO Delivery Date': '10/03/2025', 'PO Open Qty': '19', 'Buyer': 'John', 'Buyer email': 'john@happyrobot.ai', 'supplier_email': 'skyworksparts@example.com', 'Supplier': 'SkyWorks Parts', 'Supplier contact name': 'Sarah Kim', 'Status': 'Delayed' },
          { 'PO Number': '7712008', 'PO line': '1', 'PO Schedule Line': '4', 'Item Code': '8851-4462', 'PO Delivery Date': '10/04/2025', 'PO Open Qty': '25', 'Buyer': 'Carlos', 'Buyer email': 'carlos@happyrobot.ai', 'supplier_email': 'mechasuppliesinc@example.com', 'Supplier': 'MechaSupplies Inc', 'Supplier contact name': 'Alex Chen', 'Status': 'Delayed' },
          { 'PO Number': '2152387', 'PO line': '2', 'PO Schedule Line': '9', 'Item Code': '4729-8831', 'PO Delivery Date': '10/07/2025', 'PO Open Qty': '17', 'Buyer': 'Nikhil', 'Buyer email': 'nikhil@happyrobot.ai', 'supplier_email': 'aerocrafttoolingco@example.com', 'Supplier': 'AeroCraft Tooling Co', 'Supplier contact name': 'Miles Ortega', 'Status': 'Delayed' },
          { 'PO Number': '3345612', 'PO line': '1', 'PO Schedule Line': '7', 'Item Code': '5612-3394', 'PO Delivery Date': '10/15/2025', 'PO Open Qty': '44', 'Buyer': 'Carlos', 'Buyer email': 'carlos@happyrobot.ai', 'supplier_email': 'steelforgeltd@example.com', 'Supplier': 'SteelForge Ltd', 'Supplier contact name': 'Jordan Parker', 'Status': 'Email Sent' },
          { 'PO Number': '5512389', 'PO line': '3', 'PO Schedule Line': '2', 'Item Code': '9223-7654', 'PO Delivery Date': '10/20/2025', 'PO Open Qty': '31', 'Buyer': 'Denise', 'Buyer email': 'denise@happyrobot.ai', 'supplier_email': 'skyworksparts@example.com', 'Supplier': 'SkyWorks Parts', 'Supplier contact name': 'Sarah Kim', 'Status': 'Pending' },
          { 'PO Number': '6789123', 'PO line': '1', 'PO Schedule Line': '11', 'Item Code': '1447-9982', 'PO Delivery Date': '10/25/2025', 'PO Open Qty': '21', 'Buyer': 'Federico', 'Buyer email': 'federico@happyrobot.ai', 'supplier_email': 'mechasuppliesinc@example.com', 'Supplier': 'MechaSupplies Inc', 'Supplier contact name': 'Alex Chen', 'Status': 'At Risk' },
          { 'PO Number': '8923456', 'PO line': '2', 'PO Schedule Line': '14', 'Item Code': '6654-2217', 'PO Delivery Date': '11/01/2025', 'PO Open Qty': '36', 'Buyer': 'John', 'Buyer email': 'john@happyrobot.ai', 'supplier_email': 'aerocrafttoolingco@example.com', 'Supplier': 'AeroCraft Tooling Co', 'Supplier contact name': 'Federico Ramos', 'Status': 'Phone Call' },
          { 'PO Number': '4556789', 'PO line': '1', 'PO Schedule Line': '6', 'Item Code': '3389-4451', 'PO Delivery Date': '11/10/2025', 'PO Open Qty': '27', 'Buyer': 'Carlos', 'Buyer email': 'carlos@happyrobot.ai', 'supplier_email': 'steelforgeltd@example.com', 'Supplier': 'SteelForge Ltd', 'Supplier contact name': 'Jordan Parker', 'Status': 'Confirmed' },
          { 'PO Number': '7823456', 'PO line': '3', 'PO Schedule Line': '13', 'Item Code': '7712-5539', 'PO Delivery Date': '11/15/2025', 'PO Open Qty': '18', 'Buyer': 'Nikhil', 'Buyer email': 'nikhil@happyrobot.ai', 'supplier_email': 'skyworksparts@example.com', 'Supplier': 'SkyWorks Parts', 'Supplier contact name': 'Sarah Kim', 'Status': 'On Way' },
          { 'PO Number': '3398712', 'PO line': '2', 'PO Schedule Line': '5', 'Item Code': '2218-6643', 'PO Delivery Date': '11/20/2025', 'PO Open Qty': '40', 'Buyer': 'Denise', 'Buyer email': 'denise@happyrobot.ai', 'supplier_email': 'mechasuppliesinc@example.com', 'Supplier': 'MechaSupplies Inc', 'Supplier contact name': 'Alex Chen', 'Status': 'Email Sent' },
          { 'PO Number': '9912345', 'PO line': '1', 'PO Schedule Line': '8', 'Item Code': '8834-3329', 'PO Delivery Date': '11/25/2025', 'PO Open Qty': '23', 'Buyer': 'Federico', 'Buyer email': 'federico@happyrobot.ai', 'supplier_email': 'aerocrafttoolingco@example.com', 'Supplier': 'AeroCraft Tooling Co', 'Supplier contact name': 'Miles Ortega', 'Status': 'Pending' },
          { 'PO Number': '2234567', 'PO line': '2', 'PO Schedule Line': '10', 'Item Code': '5512-7798', 'PO Delivery Date': '12/01/2025', 'PO Open Qty': '35', 'Buyer': 'John', 'Buyer email': 'john@happyrobot.ai', 'supplier_email': 'steelforgeltd@example.com', 'Supplier': 'SteelForge Ltd', 'Supplier contact name': 'Jordan Parker', 'Status': 'Delivered' }
        ];
        
        setPOData(demoData);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

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
              <h2 className="text-3xl font-serif mb-8">Supplier Directory</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...new Set(buyerData.map(po => po.Supplier))].sort().map(supplier => {
                  const supplierPOs = buyerData.filter(po => po.Supplier === supplier);
                  const contact = supplierPOs[0]['Supplier contact name'];
                  const email = supplierPOs[0]['supplier_email'];
                  const isUnreliable = unreliableSuppliers.includes(supplier);
                  
                  return (
                    <div key={supplier} className="bg-white rounded-2xl p-6 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold">{supplier}</h3>
                        {isUnreliable && (
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">Unreliable</span>
                        )}
                      </div>
                      <p className="text-gray-700 mb-1">{contact}</p>
                      <p className="text-sm text-gray-600 mb-3">{email}</p>
                      <div className="text-sm text-gray-500">
                        {supplierPOs.length} active PO{supplierPOs.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  );
                })}
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