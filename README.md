# Canvas India — Product Catalog Submission Form

A simple web form for collecting product details from the client, built to
replace the Excel-based data collection sheet. Submissions save to a
database; an admin page lets you review them and download everything as a
ready-to-import Excel file at any time.

- **Public form** (`/`) — client fills in product details (name, category,
  shape, size, material, finish, pricing, stock, Cloudinary image links).
  Supports adding multiple size/finish rows per product without retyping
  shared fields.
- **Admin page** (`/admin`) — lists every submitted row, lets you delete bad
  entries, and has a **Download as Excel** button that generates an `.xlsx`
  file matching the same column structure as the original hand-built sheet.

**Note:** the admin page has no password protection in this version — anyone
with the URL can view submissions and download the export. Fine for a
short-lived internal tool with an unlisted URL; add protection before this
stays live long-term or the URL gets shared casually.

## Local development

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init   # applies the schema to your database
npm run dev
```

You'll need a `DATABASE_URL` in a `.env` file pointing at a Postgres
database — see Deployment below for how to get one from Vercel.

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel: **New Project** → import this repo.
3. Before the first deploy, add a Postgres database:
   - In the Vercel project dashboard → **Storage** tab → **Create Database**
     → **Postgres**.
   - This automatically sets the `DATABASE_URL` (and a few related) environment
     variables for you — no manual copying needed.
4. Deploy.
5. After the first deploy, run the migration against the real database once:
   ```bash
   # From your local machine, with the Vercel-provided DATABASE_URL in .env
   npx prisma migrate deploy
   ```
   (Or run `npx prisma db push` if you'd rather skip migration history for
   this small a project.)
6. Visit `https://<your-project>.vercel.app` for the form and
   `https://<your-project>.vercel.app/admin` for the admin page.

## Tech

Next.js (App Router) · Prisma + Postgres · ExcelJS for the `.xlsx` export.
