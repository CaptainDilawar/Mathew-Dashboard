import { useState, useEffect, useRef } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Button, Tabs, Tab, Box, Card, CardContent, Grid, CssBaseline, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Select, MenuItem, TextField, TableContainer, TablePagination, TableSortLabel, Paper, InputLabel, FormControl, Fab, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Drawer, Menu, useMediaQuery } from '@mui/material';
import { Brightness4, Brightness7, SaveAlt, Refresh, Chat, Send, Logout, Menu as MenuIcon, Close } from '@mui/icons-material';
import Papa from 'papaparse';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { fakerEN_US as faker } from '@faker-js/faker';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import './App.css';
import LoginPage from './LoginPage';
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? 'https://your-backend-url.com' : 'http://localhost:3001');

Chart.register(...registerables, ChartDataLabels);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [leadsPerCategory, setLeadsPerCategory] = useState({});
  const [companiesPerYear, setCompaniesPerYear] = useState({});
  const [topPositions, setTopPositions] = useState({});
  const [topFundedCompanies, setTopFundedCompanies] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [animatedLeads, setAnimatedLeads] = useState(0);
  const [animatedCompanies, setAnimatedCompanies] = useState(0);
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:899px)');

  // Chatbot states
  const [isChatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! How can I help you today?' }
  ]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };


  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { sender: 'user', text: chatInput };
    setMessages(prevMessages => [...prevMessages, userMessage]);

    const webhookUrl = `https://mrecai.app.n8n.cloud/webhook/c6a6f65e-3c4e-4983-a78d-2fd984e66165?message=${encodeURIComponent(chatInput)}`;

    try {
      const response = await fetch(webhookUrl, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Raw response from n8n:', data);

      let responseText = 'No response from bot.';

      if (typeof data === 'string') {
        responseText = data;
      } else if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0];
        if (typeof firstItem === 'string') {
          responseText = firstItem;
        } else {
          responseText = firstItem.output || firstItem.message || firstItem.text || firstItem.response || firstItem.reply || firstItem.msg || JSON.stringify(firstItem);
        }
      } else if (typeof data === 'object' && data !== null) {
        responseText = data.output || data.message || data.text || data.response || data.reply || data.msg || JSON.stringify(data);
      }

      const botResponse = { sender: 'bot', text: responseText };
      setMessages(prevMessages => [...prevMessages, botResponse]);

    } catch (error) {
      console.error('Failed to send message:', error);
      const botResponse = { sender: 'bot', text: 'Failed to send message. Please try again later.' };
      setMessages(prevMessages => [...prevMessages, botResponse]);
    }

    setChatInput('');
  };


  // Refs for chart exports
  const leadsChartRef = useRef(null);
  const companiesChartRef = useRef(null);
  const positionsChartRef = useRef(null);

  // Data/state for CSV, filters, table
  const [companiesData, setCompaniesData] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterYearFrom, setFilterYearFrom] = useState('');
  const [filterYearTo, setFilterYearTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('funding');
  const [genericData, setGenericData] = useState([]);
  const [genericHeaders, setGenericHeaders] = useState([]);
  const [spreadsheetsList, setSpreadsheetsList] = useState([]);
  const [availableSheets, setAvailableSheets] = useState([]);
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState('');

  const theme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#6366f1',
        contrastText: '#fff',
      },
      secondary: {
        main: '#ec4899',
      },
      background: {
        default: '#0c0e14',
        paper: 'rgba(30, 41, 59, 0.7)',
      },
    },
    typography: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      h4: {
        fontWeight: 800,
        letterSpacing: '-0.02em',
      },
      h5: {
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      h6: {
        fontWeight: 600,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: 'transparent',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '10px 20px',
            transition: 'all 0.3s ease',
          },
        },
      },
    },
  });

  useEffect(() => {
    // Generate fake leads
    const leads = Array.from({ length: 100 }, () => ({
      category: faker.commerce.department(),
    }));
    setTotalLeads(leads.length);
    const categoryCounts = leads.reduce((acc, lead) => {
      acc[lead.category] = (acc[lead.category] || 0) + 1;
      return acc;
    }, {});
    setLeadsPerCategory(categoryCounts);

    // Generate fake companies and keep a master companiesData list
    const companies = Array.from({ length: 100 }, () => ({
      'Founded Year': faker.date.past({ years: 20 }).getFullYear(),
      Position: faker.person.jobTitle(),
      Name: faker.company.name(),
      'Total Funding': Number(faker.finance.amount(100000, 10000000, 0)),
    }));
    setCompaniesData(companies);
    setTotalCompanies(companies.length);

    const yearCounts = companies.reduce((acc, company) => {
      const year = company['Founded Year'];
      if (year) {
        acc[year] = (acc[year] || 0) + 1;
      }
      return acc;
    }, {});
    setCompaniesPerYear(yearCounts);

    const positionCounts = companies.reduce((acc, company) => {
      const position = company.Position;
      if (position) {
        acc[position] = (acc[position] || 0) + 1;
      }
      return acc;
    }, {});
    const sortedPositions = Object.entries(positionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
    setTopPositions(Object.fromEntries(sortedPositions));

    const fundedCompanies = companies
      .map(company => ({
        name: company.Name,
        position: company.Position,
        year: company['Founded Year'],
        funding: Number(company['Total Funding']),
      }))
      .sort((a, b) => b.funding - a.funding)
      .slice(0, 10);
    setTopFundedCompanies(fundedCompanies);

    // Initial fetch of spreadsheets
    fetchSpreadsheets();
  }, []);

  const fetchSpreadsheets = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/spreadsheets`);
      if (response.ok) {
        const data = await response.json();
        setSpreadsheetsList(data);
      }
    } catch (err) {
      console.error('Failed to fetch spreadsheets:', err);
    }
  };

  const fetchSheetMetadata = async (ssId) => {
    if (!ssId) return;
    try {
      const response = await fetch(`${API_BASE}/api/sheets/${ssId}/metadata`);
      if (response.ok) {
        const data = await response.json();
        setAvailableSheets(data);
        if (data.length > 0) {
          setSheetName(data[0]);
          // Auto-load first sheet tab when a spreadsheet is selected
          await handleSheetLoad(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch sheet metadata:', err);
    }
  };

  useEffect(() => {
    if (selectedSpreadsheetId) {
      fetchSheetMetadata(selectedSpreadsheetId);
    }
  }, [selectedSpreadsheetId]);

  // Handle CSV upload (expects company rows with Name, Founded Year, Position, Total Funding or lead rows with category)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data || [];
        if (!rows.length) return;

        // Detect if it's leads or companies
        if (rows[0].category) {
          // Leads CSV
          const categoryCounts = rows.reduce((acc, r) => {
            if (r.category) acc[r.category] = (acc[r.category] || 0) + 1;
            return acc;
          }, {});
          setLeadsPerCategory(categoryCounts);
          setTotalLeads(rows.length);
        } else {
          // Companies CSV
          const parsed = rows.map(r => ({
            Name: r.Name || r.name || '',
            Position: r.Position || r.position || '',
            'Founded Year': Number(r['Founded Year'] || r.founded_year || r.year || ''),
            'Total Funding': Number(r['Total Funding'] || r.funding || r.total_funding || 0),
          }));
          setCompaniesData(parsed);
          setTotalCompanies(parsed.length);

          const yearCounts = parsed.reduce((acc, company) => {
            const year = company['Founded Year'];
            if (year) acc[year] = (acc[year] || 0) + 1;
            return acc;
          }, {});
          setCompaniesPerYear(yearCounts);

          const positionCounts = parsed.reduce((acc, company) => {
            const position = company.Position;
            if (position) acc[position] = (acc[position] || 0) + 1;
            return acc;
          }, {});
          const sortedPositions = Object.entries(positionCounts).sort(([, a], [, b]) => b - a).slice(0, 10);
          setTopPositions(Object.fromEntries(sortedPositions));

          const fundedCompanies = parsed.map(c => ({ name: c.Name, position: c.Position, year: c['Founded Year'], funding: Number(c['Total Funding']) }))
            .sort((a, b) => b.funding - a.funding)
            .slice(0, 10);
          setTopFundedCompanies(fundedCompanies);
        }
      }
    });
  };

  // Export filtered companies to CSV
  const exportCompaniesCSV = (companiesToExport) => {
    const rows = (companiesToExport || []).map(c => ({ Name: c.name || c.Name || '', Position: c.position || c.Position || '', Year: c.year || c['Founded Year'] || '', Funding: c.funding || c['Total Funding'] || 0 }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'companies_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Derived and helper for table filtering, sorting, pagination
  const filteredCompanies = companiesData.filter((c) => {
    const q = searchQuery.trim().toLowerCase();
    let pass = true;
    if (filterYearFrom) pass = pass && (Number(c['Founded Year']) >= Number(filterYearFrom));
    if (filterYearTo) pass = pass && (Number(c['Founded Year']) <= Number(filterYearTo));
    if (searchQuery) {
      const name = (c.Name || c.name || '').toString().toLowerCase();
      const pos = (c.Position || c.position || '').toString().toLowerCase();
      pass = pass && (name.includes(q) || pos.includes(q));
    }
    return pass;
  });

  const normalizedCompanies = filteredCompanies.map(c => ({ name: c.Name || c.name || '', position: c.Position || c.position || '', year: c['Founded Year'] || c.year || '', funding: Number(c['Total Funding'] || c.funding || 0) }));

  const sortedCompanies = normalizedCompanies.slice().sort((a, b) => {
    if (orderBy === 'funding') {
      return order === 'desc' ? b.funding - a.funding : a.funding - b.funding;
    }
    return 0;
  });

  const paginatedCompanies = sortedCompanies.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Refresh / regenerate fake data
  const refreshData = () => {
    const companies = Array.from({ length: 100 }, () => ({
      'Founded Year': faker.date.past({ years: 20 }).getFullYear(),
      Position: faker.person.jobTitle(),
      Name: faker.company.name(),
      'Total Funding': Number(faker.finance.amount(100000, 10000000, 0)),
    }));
    setCompaniesData(companies);
    setTotalCompanies(companies.length);

    const yearCounts = companies.reduce((acc, company) => {
      const year = company['Founded Year'];
      if (year) acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {});
    setCompaniesPerYear(yearCounts);

    const positionCounts = companies.reduce((acc, company) => {
      const position = company.Position;
      if (position) acc[position] = (acc[position] || 0) + 1;
      return acc;
    }, {});
    const sortedPositions = Object.entries(positionCounts).sort(([, a], [, b]) => b - a).slice(0, 10);
    setTopPositions(Object.fromEntries(sortedPositions));

    const fundedCompanies = companies.map(company => ({ name: company.Name, position: company.Position, year: company['Founded Year'], funding: Number(company['Total Funding']) })).sort((a, b) => b.funding - a.funding).slice(0, 10);
    setTopFundedCompanies(fundedCompanies);
  };

  // animate counters smoothly when totals are set
  useEffect(() => {
    let raf;
    const duration = 800;
    const startTime = performance.now();
    const animate = (now) => {
      const t = Math.min(1, (now - startTime) / duration);
      setAnimatedLeads(Math.floor(totalLeads * t));
      setAnimatedCompanies(Math.floor(totalCompanies * t));
      if (t < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [totalLeads, totalCompanies]);

  const leadsChartData = {
    labels: Object.keys(leadsPerCategory).sort(),
    datasets: [
      {
        label: 'Number of Leads per Category',
        data: Object.entries(leadsPerCategory)
          .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
          .map(([, count]) => count),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const companiesChartData = {
    labels: Object.keys(companiesPerYear).sort((a, b) => a - b),
    datasets: [
      {
        label: 'Number of Companies Founded per Year',
        data: Object.entries(companiesPerYear)
          .sort(([yearA], [yearB]) => yearA - yearB)
          .map(([, count]) => count),
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
        borderColor: 'rgba(255, 99, 132, 1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const positionsChartData = {
    labels: Object.keys(topPositions),
    datasets: [
      {
        label: 'Top 10 Job Positions',
        data: Object.values(topPositions),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#7F66FF', '#FF6347', '#8BC34A'
        ],
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: { position: 'top', labels: { color: '#94a3b8', font: { family: 'Outfit', size: 12 } } },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { family: 'Outfit' },
        bodyFont: { family: 'Outfit' },
        padding: 12,
        cornerRadius: 8
      },
      datalabels: {
        color: '#fff',
        anchor: 'end',
        align: 'top',
        formatter: (value) => value.toLocaleString(),
        font: { family: 'Outfit', weight: 'bold' }
      },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', font: { family: 'Outfit' } },
        grid: { display: false }
      },
      y: {
        ticks: { color: '#94a3b8', font: { family: 'Outfit' } },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      }
    }
  };

  // --- Export helpers ---
  const exportChartPNG = (ref, filename = 'chart.png') => {
    try {
      const chart = ref?.current;
      const toBase64 = chart?.toBase64Image?.bind(chart) || chart?.chart?.toBase64Image?.bind(chart.chart) || chart?.canvas?.toDataURL?.bind(chart.canvas);
      if (!toBase64) {
        console.warn('Export not available for this chart instance.');
        return;
      }
      const base64 = toBase64();
      const link = document.createElement('a');
      link.href = base64;
      link.download = filename;
      link.click();
    } catch (err) {
      console.error('Failed to export chart:', err);
    }
  };

  const exportToCSV = (rows, filename = 'data.csv') => {
    try {
      if (!rows || rows.length === 0) return;
      const headers = Object.keys(rows[0]);
      const csv = [headers.join(',')].concat(rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSV export failed:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // State for Google Sheets
  const [sheetId, setSheetId] = useState('');
  const [sheetName, setSheetName] = useState('Sheet1');
  const [loadingSheet, setLoadingSheet] = useState(false);

  // Fetch data from local backend
  const handleSheetLoad = async (rangeParam) => {
    if (!selectedSpreadsheetId) {
      alert('Please select a Google Spreadsheet');
      return;
    }
    const rangeToUse = rangeParam || sheetName || 'Sheet1';
    setLoadingSheet(true);
    try {
      const response = await fetch(`${API_BASE}/api/sheets/${selectedSpreadsheetId}?range=${encodeURIComponent(rangeToUse)}`);
      if (!response.ok) throw new Error('Failed to fetch from backend');
      const rows = await response.json();

      if (!rows || rows.length === 0) {
        alert('Sheet is empty');
        return;
      }

      // Store as generic data for the table
      const headers = rows[0].map(h => h.toString().trim());
      setGenericHeaders(headers);
      const dataObjects = rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });
      setGenericData(dataObjects);

      // Try to detect Leads or Companies for summary/charts
      const firstRowObj = dataObjects[0] || {};
      const hasCategory = headers.some(h => h.toLowerCase() === 'category');
      const hasFunding = headers.some(h => h.toLowerCase().includes('funding'));

      if (hasCategory) {
        // Leads Logic
        const catKey = headers.find(h => h.toLowerCase() === 'category');
        const categoryCounts = dataObjects.reduce((acc, r) => {
          if (r[catKey]) acc[r[catKey]] = (acc[r[catKey]] || 0) + 1;
          return acc;
        }, {});
        console.log('Loaded lead categories:', categoryCounts);
        setLeadsPerCategory(categoryCounts);
        setTotalLeads(dataObjects.length);
        // Clear company-related mock data so charts reflect spreadsheet
        setCompaniesData([]);
        setCompaniesPerYear({});
        setTopPositions({});
        setTopFundedCompanies([]);
        setGenericData(dataObjects);
        setActiveTab(0); // Switch to Summary (leads info shown in Summary) 
      } else if (hasFunding) {
        // Companies Logic
        const nameKey = headers.find(h => ['name', 'company name'].includes(h.toLowerCase())) || headers[0];
        const posKey = headers.find(h => h.toLowerCase().includes('position')) || headers[1];
        const yearKey = headers.find(h => h.toLowerCase().includes('year')) || headers[2];
        const fundKey = headers.find(h => h.toLowerCase().includes('funding')) || headers[3];

        const parsed = dataObjects.map(r => ({
          Name: r[nameKey] || '',
          Position: r[posKey] || '',
          'Founded Year': Number(r[yearKey] || ''),
          'Total Funding': Number(r[fundKey] || 0),
        }));
        console.log('Loaded companies count:', parsed.length);
        setCompaniesData(parsed);
        setTotalCompanies(parsed.length);

        const yearCounts = parsed.reduce((acc, company) => {
          const year = company['Founded Year'];
          if (year) acc[year] = (acc[year] || 0) + 1;
          return acc;
        }, {});
        setCompaniesPerYear(yearCounts);

        const positionCounts = parsed.reduce((acc, company) => {
          const position = company.Position;
          if (position) acc[position] = (acc[position] || 0) + 1;
          return acc;
        }, {});
        const sortedPositions = Object.entries(positionCounts).sort(([, a], [, b]) => b - a).slice(0, 10);
        setTopPositions(Object.fromEntries(sortedPositions));

        const fundedCompanies = parsed.map(c => ({ name: c.Name, position: c.Position, year: c['Founded Year'], funding: Number(c['Total Funding']) }))
          .sort((a, b) => b.funding - a.funding)
          .slice(0, 10);
        setTopFundedCompanies(fundedCompanies);
        // Clear leads-related mock data
        setLeadsPerCategory({});
        setTotalLeads(0);
        setGenericData(dataObjects);
        setActiveTab(1);
      } else {
        // Generic data - just show the table and clear all charts
        console.log('Loaded generic sheet with headers:', headers);
        setTotalLeads(0);
        setTotalCompanies(0);
        setLeadsPerCategory({});
        setCompaniesPerYear({});
        setTopPositions({});
        setTopFundedCompanies([]);
        setGenericData(dataObjects);
        setActiveTab(3); // Switch to table view
      }
      alert('Data loaded successfully!');

    } catch (error) {
      console.error(error);
      alert('Error loading sheet. Check backend console for details. Ensure Sheet Name matches exactly.');
    } finally {
      setLoadingSheet(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoginPage onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar
        position="sticky"
        sx={{
          background: 'rgba(12, 14, 20, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: 'none'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Dashboard</Typography>
          {isMobile ? (
            <IconButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)} color="inherit">
              {mobileMenuOpen ? <Close /> : <MenuIcon />}
            </IconButton>
          ) : (
            <IconButton onClick={handleLogout} color="inherit">
              <Logout />
            </IconButton>
          )}
        </Toolbar>
        {!isMobile && (
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            centered
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                background: 'linear-gradient(90deg, #6366f1, #ec4899)',
              },
              '& .MuiTab-root': {
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#94a3b8',
                '&.Mui-selected': { color: '#fff' }
              }
            }}
          >
            <Tab label="Overview" />
            <Tab label="Growth Trends" />
            <Tab label="Market Dist." />
            <Tab label="Top Entities" />
          </Tabs>
        )}
      </AppBar>
      {isMobile && mobileMenuOpen && (
        <Box
          sx={{
            background: 'rgba(12, 14, 20, 0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            padding: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}
        >
          <Button
            fullWidth
            onClick={() => {
              setActiveTab(0);
              setMobileMenuOpen(false);
            }}
            sx={{
              justifyContent: 'flex-start',
              color: activeTab === 0 ? '#6366f1' : '#94a3b8',
              fontWeight: activeTab === 0 ? 700 : 500,
              padding: '12px 16px',
              borderLeft: activeTab === 0 ? '3px solid #6366f1' : 'none',
              '&:hover': { background: 'rgba(99, 102, 241, 0.1)' }
            }}
          >
            Overview
          </Button>
          <Button
            fullWidth
            onClick={() => {
              setActiveTab(1);
              setMobileMenuOpen(false);
            }}
            sx={{
              justifyContent: 'flex-start',
              color: activeTab === 1 ? '#6366f1' : '#94a3b8',
              fontWeight: activeTab === 1 ? 700 : 500,
              padding: '12px 16px',
              borderLeft: activeTab === 1 ? '3px solid #6366f1' : 'none',
              '&:hover': { background: 'rgba(99, 102, 241, 0.1)' }
            }}
          >
            Growth Trends
          </Button>
          <Button
            fullWidth
            onClick={() => {
              setActiveTab(2);
              setMobileMenuOpen(false);
            }}
            sx={{
              justifyContent: 'flex-start',
              color: activeTab === 2 ? '#6366f1' : '#94a3b8',
              fontWeight: activeTab === 2 ? 700 : 500,
              padding: '12px 16px',
              borderLeft: activeTab === 2 ? '3px solid #6366f1' : 'none',
              '&:hover': { background: 'rgba(99, 102, 241, 0.1)' }
            }}
          >
            Market Distribution
          </Button>
          <Button
            fullWidth
            onClick={() => {
              setActiveTab(3);
              setMobileMenuOpen(false);
            }}
            sx={{
              justifyContent: 'flex-start',
              color: activeTab === 3 ? '#6366f1' : '#94a3b8',
              fontWeight: activeTab === 3 ? 700 : 500,
              padding: '12px 16px',
              borderLeft: activeTab === 3 ? '3px solid #6366f1' : 'none',
              '&:hover': { background: 'rgba(99, 102, 241, 0.1)' }
            }}
          >
            Top Entities
          </Button>
          <Box sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', mt: 2, pt: 2 }}>
            <Button
              fullWidth
              onClick={handleLogout}
              startIcon={<Logout />}
              sx={{
                justifyContent: 'flex-start',
                color: '#ec4899',
                fontWeight: 600,
                padding: '12px 16px',
                '&:hover': { background: 'rgba(236, 72, 153, 0.1)' }
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>
      )}
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ mt: 2 }}>
          {/* Controls: Google Sheets, CSV upload, filters, search, export, refresh */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
            {/* Google Sheets Selection */}
            <Grid item>
              <FormControl size="small" sx={{ width: 220 }}>
                <InputLabel id="spreadsheet-label">Spreadsheet</InputLabel>
                <Select
                  labelId="spreadsheet-label"
                  value={selectedSpreadsheetId}
                  label="Spreadsheet"
                  onChange={(e) => setSelectedSpreadsheetId(e.target.value)}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {spreadsheetsList.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item>
              <FormControl size="small" sx={{ width: 150 }}>
                <InputLabel id="sheet-label">Sheet</InputLabel>
                <Select
                  labelId="sheet-label"
                  value={sheetName}
                  label="Sheet"
                  onChange={(e) => setSheetName(e.target.value)}
                  disabled={!selectedSpreadsheetId}
                >
                  {availableSheets.map(name => <MenuItem key={name} value={name}>{name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item>
              <Button variant="contained" onClick={handleSheetLoad} disabled={loadingSheet || !selectedSpreadsheetId}>
                {loadingSheet ? 'Loading...' : 'Load Data'}
              </Button>
            </Grid>
            <Grid item>
              <IconButton onClick={fetchSpreadsheets} title="Refresh Spreadsheets">
                <Refresh />
              </IconButton>
            </Grid>

            <Grid item>
              <input accept=".csv" style={{ display: 'none' }} id="upload-csv" type="file" onChange={handleFileUpload} />
              <label htmlFor="upload-csv">
                <Button variant="outlined" component="span">Upload CSV</Button>
              </label>
            </Grid>
            <Grid item>
              <FormControl size="small">
                <InputLabel id="category-label">Category</InputLabel>
                <Select labelId="category-label" value={filterCategory} label="Category" onChange={(e) => setFilterCategory(e.target.value)} sx={{ minWidth: 160 }}>
                  <MenuItem value="">All</MenuItem>
                  {Object.keys(leadsPerCategory).sort().map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item>
              <TextField size="small" label="Year From" value={filterYearFrom} onChange={(e) => setFilterYearFrom(e.target.value)} sx={{ width: 110 }} />
            </Grid>
            <Grid item>
              <TextField size="small" label="Year To" value={filterYearTo} onChange={(e) => setFilterYearTo(e.target.value)} sx={{ width: 110 }} />
            </Grid>
            <Grid item>
              <TextField size="small" label="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} sx={{ width: 220 }} />
            </Grid>
            <Grid item>
              <Button startIcon={<SaveAlt />} variant="outlined" onClick={() => exportCompaniesCSV(filteredCompanies)}>Export CSV</Button>
            </Grid>
            <Grid item>
              <Button startIcon={<Refresh />} variant="outlined" onClick={refreshData}>Mock Data</Button>
            </Grid>
          </Grid>

          {activeTab === 0 && (
            <Card className="glass-card" sx={{ p: 2 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ mb: 4, fontWeight: 700 }}>Overview Dashboard</Typography>
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
                    <Box className="glass-card big-number" sx={{ p: 4, textAlign: 'center', background: 'rgba(99, 102, 241, 0.05)' }}>
                      <Typography variant="h6" sx={{ color: 'var(--text-secondary)', mb: 1 }}>Total Leads</Typography>
                      <Typography variant="h4">{animatedLeads.toLocaleString()}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box className="glass-card big-number" sx={{ p: 4, textAlign: 'center', background: 'rgba(236, 72, 153, 0.05)' }}>
                      <Typography variant="h6" sx={{ color: 'var(--text-secondary)', mb: 1 }}>Total Companies</Typography>
                      <Typography variant="h4">{animatedCompanies.toLocaleString()}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
          {/* Leads per Category tab removed — leads data now updates the Summary or Table when a sheet contains categories */}
          {activeTab === 1 && (
            <Card className="glass-card">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>Growth Trends</Typography>
                  <Box>
                    <Button variant="outlined" size="small" onClick={() => exportChartPNG(companiesChartRef, 'companies-chart.png')}>Export Analytics</Button>
                  </Box>
                </Box>
                <Box sx={{ height: 450 }}>
                  <Line ref={companiesChartRef} data={companiesChartData} options={{ ...commonOptions, scales: { y: { beginAtZero: true } } }} />
                </Box>
              </CardContent>
            </Card>
          )}
          {activeTab === 2 && (
            <Card className="glass-card">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>Market Distribution</Typography>
                  <Box>
                    <Button variant="outlined" size="small" onClick={() => exportChartPNG(positionsChartRef, 'positions-chart.png')}>Export Visual</Button>
                  </Box>
                </Box>
                <Box sx={{ height: 450 }}>
                  <Pie ref={positionsChartRef} data={positionsChartData} options={{ ...commonOptions, plugins: { ...commonOptions.plugins, datalabels: { ...commonOptions.plugins.datalabels, anchor: 'center', align: 'center' } } }} />
                </Box>
              </CardContent>
            </Card>
          )}
          {activeTab === 3 && (
            <Card className="glass-card">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>Top Funded Entities</Typography>
                  <Box>
                    <Button variant="contained" size="small" startIcon={<SaveAlt />} onClick={() => exportCompaniesCSV(sortedCompanies)}>Export Dataset</Button>
                  </Box>
                </Box>
                <TableContainer component={Paper} sx={{ mt: 1 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        {(genericHeaders.length > 0 ? genericHeaders : ['Company Name', 'Total Funding (USD)']).map((header) => (
                          <TableCell key={header} align={header.toLowerCase().includes('funding') ? 'right' : 'left'}>
                            {header}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(genericData.length > 0 ? genericData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : paginatedCompanies).map((row, index) => (
                        <TableRow key={index}>
                          {(genericHeaders.length > 0 ? genericHeaders : ['name', 'funding']).map((key) => (
                            <TableCell key={key} align={key.toLowerCase().includes('funding') ? 'right' : 'left'}>
                              {typeof row[key] === 'number' ? row[key].toLocaleString() : row[key]}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={genericData.length > 0 ? genericData.length : sortedCompanies.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>

      {/* Chatbot FAB and Dialog */}
      <Fab
        color="primary"
        aria-label="chat"
        onClick={() => setChatOpen(true)}
        className="pulse-button"
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
        }}
      >
        <Chat />
      </Fab>

      <Dialog
        open={isChatOpen}
        onClose={() => setChatOpen(false)}
        className="chat-window"
        PaperProps={{
          sx: {
            width: '420px',
            height: '600px',
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5)',
          },
        }}
      >
        <DialogTitle sx={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Box sx={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Chat sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ color: '#fff' }}>AI Assistant</Typography>
            <Typography variant="caption" sx={{ color: 'var(--accent-success)' }}>● Online</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto', bgcolor: 'transparent' }}>
          <List sx={{ width: '100%', p: 0 }}>
            {messages.map((msg, index) => (
              <ListItem key={index} className="message-animate" sx={{
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                px: 1,
                mb: 1
              }}>
                <Box sx={{ maxWidth: '85%' }}>
                  <ListItemText
                    primary={msg.text}
                    className={msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontSize: '0.95rem',
                        lineHeight: 1.5,
                        color: '#fff'
                      },
                      p: 2,
                    }}
                  />
                  <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'rgba(255,255,255,0.4)', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                    {msg.sender === 'user' ? 'You' : 'Assistant'}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.05)', bgcolor: 'rgba(255,255,255,0.02)' }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Describe your data needs..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
                e.preventDefault();
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                '& fieldset': { border: 'none' },
                '&:hover fieldset': { border: 'none' },
                '&.Mui-focused fieldset': { border: 'none' },
              }
            }}
          />
          <IconButton
            onClick={handleSendMessage}
            disabled={!chatInput.trim()}
            sx={{
              bgcolor: 'var(--accent-primary)',
              color: '#fff',
              '&:hover': { bgcolor: '#4f46e5' },
              '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)' }
            }}
          >
            <Send />
          </IconButton>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

export default App;