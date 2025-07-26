# دليل أسعار الأدوية المصرية | Egyptian Drug Pricing App

A comprehensive, real-time drug pricing application for the Egyptian market with advanced analytics, PWA support, and data export capabilities.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/wagihm62-2280s-projects/v0-real-time-drug-pricing-app)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## ✨ Enhanced Features

### 🔍 Advanced Search & Filtering
- **Smart Search**: Search by drug name or ID with instant results
- **Price Range Filtering**: Filter drugs by price range with interactive sliders
- **Price Change Filters**: Show only drugs with price increases, decreases, or no change
- **Discount Filtering**: Filter drugs by discount percentage
- **Multi-criteria Sorting**: Sort by name, price, change percentage, or discount

### 📊 Analytics Dashboard
- **Price Distribution Charts**: Visual representation of drug price ranges
- **Price Change Analytics**: Pie charts showing price change patterns
- **Top Movers**: Lists of drugs with highest price increases/decreases
- **Statistical Summary**: Average prices, medians, and key metrics
- **Shortage Tracking**: Critical drug shortage monitoring

### 📱 Progressive Web App (PWA)
- **Installable**: Add to home screen on mobile and desktop
- **Offline Support**: Browse cached data when offline
- **Background Updates**: Automatic data syncing
- **Push Notifications**: Get notified about critical shortages (future)
- **App Shortcuts**: Quick access to search, shortages, and analytics

### 📤 Data Export & Sharing
- **PDF Export**: Generate professional drug price reports
- **Excel/CSV Export**: Export filtered data for further analysis
- **Print Support**: Optimized printing layouts
- **Share Functionality**: Share data via native sharing APIs
- **Custom Reports**: Include statistics and charts in exports

### 🚀 Performance Enhancements
- **Optimized Filtering**: Efficient multi-criteria filtering algorithms
- **Virtual Scrolling**: Handle large datasets smoothly
- **Smart Caching**: Intelligent data caching strategies
- **Performance Monitoring**: Real-time performance metrics (dev mode)
- **Error Boundaries**: Comprehensive error handling and recovery

### 🎨 Enhanced UI/UX
- **RTL Support**: Full Arabic language and layout support
- **Responsive Design**: Optimized for all screen sizes
- **Dark/Light Themes**: System preference detection
- **Accessibility**: WCAG compliant interface
- **Toast Notifications**: User-friendly feedback system

## 🛠 Technology Stack

- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts for data visualization
- **PDF Generation**: jsPDF + jsPDF-AutoTable
- **PWA**: next-pwa for offline support
- **State Management**: React hooks with optimized updates
- **Caching**: Custom cache management system

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd drug-pricing-app

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

### Environment Setup

The app connects to Firebase Realtime Database. Ensure your database structure matches:

```json
{
  "drugs": {
    "1": {
      "name": "Drug Name",
      "newPrice": 100.50,
      "oldPrice": 95.00,
      "no": "1",
      "updateDate": "2024-01-15",
      "averageDiscountPercent": 5.5
    }
  },
  "shortages": {
    "id": {
      "drugName": "Drug Name",
      "status": "critical",
      "reason": "Supply chain issues",
      "reportDate": "2024-01-15T10:00:00Z"
    }
  }
}
```

## 📱 PWA Installation

### Mobile (Android/iOS)
1. Open the app in your mobile browser
2. Tap the browser menu
3. Select "Add to Home Screen" or "Install App"
4. Confirm installation

### Desktop (Chrome/Edge)
1. Visit the app URL
2. Click the install icon in the address bar
3. Click "Install" in the popup

## 📊 Analytics Features

### Price Distribution
- Bar charts showing drug count by price ranges
- Interactive tooltips with detailed information
- Color-coded ranges for easy identification

### Trend Analysis
- Price change pie charts
- Top gaining and losing drugs
- Historical price movement tracking

### Statistics Dashboard
- Total drug count
- Average and median prices
- Discount percentages
- Critical shortage alerts

## 📤 Export Options

### PDF Reports
- Professional formatting with Arabic support
- Include statistics and drug listings
- Customizable report content
- Print-optimized layouts

### Excel/CSV Export
- Full data export with proper encoding
- Arabic text support with BOM
- Customizable column selection
- Compatible with Excel and Google Sheets

## 🔧 Performance Features

### Optimization
- React.memo for component optimization
- useMemo for expensive calculations
- Debounced search inputs
- Lazy loading for charts and exports

### Monitoring
- Real-time performance metrics
- API response time tracking
- Cache hit rate monitoring
- Error boundary protection

## 🌐 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
npm run build
npx vercel --prod
```

### Manual Build
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the error boundary for detailed error information
2. Clear browser cache and localStorage
3. Reload the application
4. Report bugs through the error reporting system

## 🔮 Future Enhancements

- [ ] Real-time price alerts
- [ ] Drug comparison tool
- [ ] Pharmacy location finder
- [ ] Medicine interaction checker
- [ ] Prescription management
- [ ] Multi-language support
- [ ] API for third-party integrations

---

**Note**: This application provides drug pricing information for educational and informational purposes. Always consult healthcare professionals for medical advice.