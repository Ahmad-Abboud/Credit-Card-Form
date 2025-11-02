# Credit Card Form with Excel Storage

A credit card form simulator with real-time 3D card visualization and centralized Excel data storage.

## Features

- 📝 Interactive credit card form with real-time validation
- 💳 3D credit card visualization that updates as you type
- 📊 Centralized Excel file storage for multiple users
- 🔄 Real-time communication between form and card display
- ✨ Smooth animations and transitions
- 🎨 Card type detection (Visa, Mastercard, Amex, etc.)

## Setup Instructions

### 1. Install Dependencies

First, make sure you have Node.js installed on your system. Then run:

```bash
npm install
```

This will install the required packages:
- `express` - Web server
- `xlsx` - Excel file handling
- `cors` - Cross-origin resource sharing

### 2. Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

You should see:
```
Server running on http://localhost:3000
Excel file location: C:\Users\...\card_data.xlsx
```

### 3. Open the Form

Open your browser and navigate to:
```
http://localhost:3000/form.html
```

## How to Use

### For Users Filling the Form:

1. **Fill in the form fields:**
   - Name
   - Email (required)
   - Card Number
   - Expiration Date (MM/YY)
   - Security Code

2. **Click "Open Card View"** to see the card in a separate window

3. **Click "Save to Excel"** to save your data
   - The data will be added to the centralized `card_data.xlsx` file
   - You'll see a confirmation with the total number of entries

4. **Form will clear** after successful save, ready for the next user

### For Administrators:

The Excel file `card_data.xlsx` is created automatically in the project folder and contains:

| Name | Email | CardNumber | ExpirationDate | SecurityCode | Timestamp |
|------|-------|------------|----------------|--------------|-----------|
| John Doe | john@email.com | 4342 3342 4343 9254 | 12/25 | 123 | 11/2/2025, 3:45:00 PM |

**To download the Excel file:**
- Navigate to: `http://localhost:3000/api/download-excel`
- Or simply open the `card_data.xlsx` file in the project folder

**To view all data (JSON format):**
- Navigate to: `http://localhost:3000/api/get-card-data`

## API Endpoints

### POST `/api/save-card-data`
Saves new card data to the Excel file.

**Request Body:**
```json
{
  "Name": "John Doe",
  "Email": "john@email.com",
  "CardNumber": "4342 3342 4343 9254",
  "ExpirationDate": "12/25",
  "SecurityCode": "123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data saved successfully",
  "totalEntries": 5
}
```

### GET `/api/get-card-data`
Retrieves all saved data.

### GET `/api/download-excel`
Downloads the Excel file.

## File Structure

```
Credit-Card-Form/
├── server.js           # Backend server
├── package.json        # Dependencies
├── card_data.xlsx      # Excel file (auto-created)
├── form.html           # Form page
├── form.js             # Form logic
├── index.html          # Card display page
├── card.js             # Card update logic
├── style.css           # Styles
└── README.md           # This file
```

## Important Notes

1. **Server must be running** for the save functionality to work
2. **Email is required** - users cannot save without entering an email
3. **Data persists** - all entries are saved to the same Excel file
4. **Multiple users** can use the form simultaneously
5. **Automatic timestamps** - each entry is timestamped

## Troubleshooting

**Error: "Failed to save data. Make sure the server is running."**
- Run `npm start` to start the server
- Make sure port 3000 is not in use

**Excel file not found:**
- The file is created automatically on first save
- Check the project folder for `card_data.xlsx`

**Form not loading:**
- Access via `http://localhost:3000/form.html` (not file://)
- Make sure the server is running

## Development

To run with auto-restart on file changes:
```bash
npm run dev
```

This uses `nodemon` to automatically restart the server when you make changes.

## License

ISC

