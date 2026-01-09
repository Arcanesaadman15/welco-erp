# Welco ERP System

A comprehensive Enterprise Resource Planning system for Welco Engineering Ltd, built with Next.js, PostgreSQL, and NextAuth.js.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5-purple?logo=prisma)

## ✨ Features

- **Master Data Management**: Items, Customers, Suppliers with full CRUD operations
- **Inventory Management**: Stock tracking, barcode scanning, stock ledger
- **Purchase Module**: Requisitions, Purchase Orders, Letter of Credit, Landed Cost
- **Sales Module**: Quotations, Sales Orders, Delivery Challans, Invoices
- **Accounts Module**: Chart of Accounts, Vouchers, Receivables, Payables
- **Dashboard**: Real-time KPIs and business metrics
- **Authentication**: Secure local JWT-based auth with NextAuth.js
- **Role-based Access Control**: Admin, Manager, User roles with granular permissions

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download](https://git-scm.com/)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/welco-erp.git
cd welco-erp
```

#### 2. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

> **Note**: The default `.env` values are pre-configured to work with the included Docker setup. No changes needed for local development!

#### 3. Start the Database

```bash
# Start PostgreSQL in Docker (runs in background)
docker compose up -d
```

Wait a few seconds for the database to be ready. You can check the status with:
```bash
docker compose ps
```

#### 4. Install Dependencies

```bash
npm install
```

#### 5. Initialize the Database

```bash
# Push the database schema
npm run db:push

# Seed with initial data (admin user, sample data)
npm run db:seed
```

#### 6. Start the Development Server

```bash
npm run dev
```

#### 7. Open the Application

🎉 Visit **http://localhost:3000** in your browser!

---

## 🔐 Default Login Credentials

| Role  | Email             | Password   |
|-------|-------------------|------------|
| Admin | admin@welco.com   | admin123   |

> ⚠️ **Important**: Change these credentials in production!

---

## 📦 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16 | React Framework |
| React | 19 | UI Library |
| TypeScript | 5 | Type Safety |
| PostgreSQL | 16 | Database |
| Prisma | 5 | ORM |
| NextAuth.js | 5 (beta) | Authentication |
| TailwindCSS | 4 | Styling |
| shadcn/ui | Latest | UI Components |
| Zod | 4 | Validation |
| React Hook Form | 7 | Form Management |

---

## 🛠️ Available Scripts

### Development

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run lint         # Run ESLint
```

### Database

```bash
npm run db:generate  # Generate Prisma client (auto-runs on npm install)
npm run db:push      # Push Prisma schema to database
npm run db:seed      # Seed database with initial data
npm run db:studio    # Open Prisma Studio (database GUI)
npm run db:reset     # ⚠️ Reset database and reseed (destroys all data)
```

### Production

```bash
npm run build        # Build for production
npm run start        # Start production server
```

### Docker

```bash
docker compose up -d     # Start PostgreSQL container
docker compose down      # Stop PostgreSQL container
docker compose logs -f   # View container logs
```

---

## 🗂️ Project Structure

```
welco-erp/
├── prisma/
│   ├── schema.prisma      # Database schema (40+ tables)
│   └── seed.ts            # Initial data seeding
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (auth)/        # Login, Register pages
│   │   ├── (dashboard)/   # Protected dashboard pages
│   │   │   ├── accounts/  # Accounting module
│   │   │   ├── admin/     # Admin panel
│   │   │   ├── inventory/ # Inventory management
│   │   │   ├── master/    # Master data (items, customers, suppliers)
│   │   │   ├── purchase/  # Purchase module
│   │   │   ├── sales/     # Sales module
│   │   │   └── settings/  # System settings
│   │   └── api/           # API routes
│   ├── components/        # React components
│   │   ├── layout/        # Sidebar, navigation
│   │   └── ui/            # shadcn/ui components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities
│   │   ├── auth.ts        # NextAuth configuration
│   │   ├── prisma.ts      # Prisma client
│   │   └── permissions.ts # RBAC permissions
│   └── types/             # TypeScript types
├── public/                # Static assets
├── .env.example           # Environment template
├── docker-compose.yml     # PostgreSQL container config
└── package.json
```

---

## 📊 Database Schema

The system includes **40+ interconnected tables** covering:

| Category | Tables |
|----------|--------|
| **Master Data** | Roles, Users, Departments, Locations, Items, Customers, Suppliers |
| **Inventory** | ItemStock, StockLedger, Barcodes |
| **Purchase** | PurchaseRequisitions, PurchaseOrders, LetterOfCredit, LCCosts |
| **Sales** | Quotations, SalesOrders, DeliveryChallans, SalesInvoices |
| **Accounts** | ChartOfAccounts, Vouchers, GeneralLedger, Payments |
| **System** | AuditLogs, Notifications, SystemSettings |

To explore the database visually:
```bash
npm run db:studio
```

---

## 🔐 User Roles & Permissions

| Role | Description | Capabilities |
|------|-------------|--------------|
| **Admin** | Full system access | User management, all modules, system settings |
| **Manager** | Department management | Approval rights, reports, department data |
| **User** | Basic operations | Create/view own records, limited access |

---

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:welco2026@localhost:5432/welco_erp` |
| `DIRECT_URL` | Direct database connection | Same as DATABASE_URL |
| `NEXTAUTH_URL` | Application base URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | JWT encryption secret | ⚠️ Change in production! |
| `NODE_ENV` | Environment mode | `development` |

### Generating a Secure Secret

For production, generate a strong `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

---

## 🐳 Docker Reference

### Container Management

```bash
# Start database
docker compose up -d

# Stop database
docker compose down

# Stop and remove all data
docker compose down -v

# View logs
docker compose logs -f postgres

# Check container status
docker compose ps
```

### Database Connection Details

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| Port | `5432` |
| Database | `welco_erp` |
| Username | `postgres` |
| Password | `welco2026` |

---

## 🌐 Production Deployment

### 1. Build the Application

```bash
npm run build
```

### 2. Set Production Environment Variables

```env
NODE_ENV="production"
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secure-generated-secret"
```

### 3. Run Database Migrations

```bash
npm run db:push
npm run db:seed  # Only for initial deployment
```

### 4. Start the Server

```bash
npm run start
```

### Production Checklist

- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Use a managed PostgreSQL database
- [ ] Set up SSL/TLS (HTTPS)
- [ ] Configure database backups
- [ ] Set up monitoring and logging
- [ ] Change default admin credentials

---

## 🔍 Troubleshooting

### Database Connection Issues

**Error**: `Can't reach database server`

```bash
# Check if Docker is running
docker compose ps

# Restart the database
docker compose restart

# Check logs for errors
docker compose logs postgres
```

### Port Already in Use

**Error**: `Port 5432 is already in use`

```bash
# Find what's using the port
lsof -i :5432

# Or change the port in docker-compose.yml
ports:
  - "5433:5432"  # Use 5433 instead
```

Then update your `.env`:
```env
DATABASE_URL="postgresql://postgres:welco2026@localhost:5433/welco_erp"
```

### Prisma Issues

**Error**: `@prisma/client did not initialize yet`

```bash
# Generate the Prisma client
npm run db:generate

# Or run it directly
npx prisma generate
```

**Error**: `Prisma schema out of sync`

```bash
# Reset and resync
npm run db:push

# If that fails, reset completely
npm run db:reset
```

### Node Module Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 🚧 Roadmap

- [ ] PDF report generation
- [ ] Email notifications
- [ ] Multi-company support
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Audit trail reports
- [ ] Batch operations
- [ ] API documentation (OpenAPI/Swagger)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

Private - Welco Engineering Ltd. All rights reserved.

---

## 💬 Support

For questions or issues:
- Create a GitHub Issue
- Contact the development team

---

<p align="center">
  Built with ❤️ for Welco Engineering Ltd.
</p>
