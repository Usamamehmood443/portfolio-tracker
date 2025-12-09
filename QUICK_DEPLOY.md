# ⚡ Quick Deploy Checklist

## 🎯 Goal
Deploy Portfolio Tracker for **FREE** in ~30 minutes

---

## ✅ Step-by-Step Checklist

### 1️⃣ Setup Supabase (5 min)
- [ ] Go to [supabase.com](https://supabase.com) and sign up
- [ ] Create new project: "portfolio-tracker"
- [ ] Copy database connection string
- [ ] Save password somewhere safe

**Result**: `postgresql://postgres:password@xxx.supabase.co:5432/postgres`

---

### 2️⃣ Push to GitHub (5 min)
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/portfolio-tracker.git
git push -u origin main
```

- [ ] Create GitHub repository
- [ ] Push code to GitHub

---

### 3️⃣ Deploy to Vercel (5 min)
- [ ] Sign up at [vercel.com](https://vercel.com) with GitHub
- [ ] Import `portfolio-tracker` repository
- [ ] Add environment variable:
  - `DATABASE_URL` = Your Supabase connection string
- [ ] Click Deploy
- [ ] Wait 2-3 minutes
- [ ] Copy your Vercel URL

**Result**: `https://portfolio-tracker-xxx.vercel.app`

---

### 4️⃣ Setup Database (3 min)
```bash
# Update DATABASE_URL in .env with Supabase string
npx prisma generate
npx prisma db push
npm run seed
```

- [ ] Run Prisma migrations
- [ ] Seed initial data

---

### 5️⃣ Test Your Site (2 min)
- [ ] Visit your Vercel URL
- [ ] Check if sample projects appear
- [ ] Try creating a new project
- [ ] Try editing a project

---

## 🎉 Done!

Your site is now live at: `https://your-url.vercel.app`

**Total Cost: $0/month** 💰

---

## 📝 Important URLs to Save

1. **Live Site**: `_____________________`
2. **GitHub Repo**: `_____________________`
3. **Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
4. **Supabase Dashboard**: [app.supabase.com](https://app.supabase.com)

---

## 🔄 Deploy Updates

Every time you make changes:

```bash
git add .
git commit -m "Your changes"
git push
```

Vercel automatically deploys! ✨

---

## 📞 Need Help?

See full guide: `DEPLOYMENT.md`
