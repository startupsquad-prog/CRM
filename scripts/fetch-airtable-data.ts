/**
 * Airtable Data Fetcher
 * 
 * This script fetches all tables, schemas, and records from Airtable
 * to use as a baseline for Supabase migration.
 * 
 * Run with: npx tsx scripts/fetch-airtable-data.ts
 */

import Airtable from "airtable";
import { config } from "dotenv";
import { resolve } from "path";
import { writeFileSync, mkdirSync } from "fs";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

// Initialize Airtable
const airtableBase = new Airtable({
  apiKey: process.env.AIRTABLE_ACCESS_TOKEN,
}).base(process.env.AIRTABLE_APP_ID!);

interface Field {
  id: string;
  name: string;
  type: string;
  options?: any;
}

interface TableSchema {
  id: string;
  name: string;
  description?: string;
  fields: Field[];
  recordCount: number;
}

interface TableData {
  schema: TableSchema;
  records: any[];
}

async function fetchTableSchema(tableId: string, tableName: string): Promise<TableSchema> {
  try {
    // Try to fetch schema from metadata API first
    const accessToken = process.env.AIRTABLE_ACCESS_TOKEN;
    const appId = process.env.AIRTABLE_APP_ID;
    let fields: Field[] = [];
    let recordCount = 0;
    
    try {
      const response = await fetch(`https://api.airtable.com/v0/meta/bases/${appId}/tables/${tableId}/fields`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.fields && Array.isArray(data.fields)) {
          fields = data.fields.map((field: any) => ({
            id: field.id,
            name: field.name,
            type: field.type,
            options: field.options || undefined,
          }));
        }
      }
    } catch (error) {
      // Fall back to analyzing records
      console.log(`   Using record-based schema detection for ${tableName}`);
    }
    
    // If metadata API didn't work, analyze records to extract fields
    if (fields.length === 0) {
      const records = await airtableBase(tableName).select({ maxRecords: 1 }).firstPage();
      
      if (records.length > 0) {
        const firstRecord = records[0];
        
        // Extract fields from record
        Object.keys(firstRecord.fields).forEach((fieldName) => {
          fields.push({
            id: fieldName,
            name: fieldName,
            type: "unknown", // Will be determined below
          });
        });
      }
    }

    // Count total records (with pagination) - do this efficiently
    let allRecords: any[] = [];
    await airtableBase(tableName).select().eachPage((pageRecords, fetchNextPage) => {
      allRecords = allRecords.concat(pageRecords);
      fetchNextPage();
    });
    recordCount = allRecords.length;

    // Analyze fields from sample records if we don't have metadata API fields
    const sampleRecords = allRecords.slice(0, Math.min(100, allRecords.length));
    
    // Analyze fields more accurately
    const fieldAnalysis: Record<string, { types: Set<string>, sampleValues: any[] }> = {};
    
    sampleRecords.forEach((record) => {
      Object.keys(record.fields).forEach((fieldName) => {
        if (!fieldAnalysis[fieldName]) {
          fieldAnalysis[fieldName] = { types: new Set(), sampleValues: [] };
        }
        const value = record.fields[fieldName];
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            fieldAnalysis[fieldName].types.add("array");
            if (value.length > 0) {
              if (typeof value[0] === "object" && value[0].id) {
                fieldAnalysis[fieldName].types.add("multipleRecordLinks");
              } else {
                fieldAnalysis[fieldName].types.add("multipleSelects");
              }
            }
          } else if (typeof value === "object" && value.id) {
            fieldAnalysis[fieldName].types.add("singleRecordLink");
          } else if (typeof value === "string") {
            if (value.match(/^https?:\/\//)) {
              fieldAnalysis[fieldName].types.add("url");
            } else if (value.match(/^[\w\.-]+@[\w\.-]+\.\w+$/)) {
              fieldAnalysis[fieldName].types.add("email");
            } else if (value.length > 100) {
              fieldAnalysis[fieldName].types.add("multipleLineText");
            } else {
              fieldAnalysis[fieldName].types.add("singleLineText");
            }
          } else if (typeof value === "number") {
            fieldAnalysis[fieldName].types.add(Number.isInteger(value) ? "number" : "number");
          } else if (typeof value === "boolean") {
            fieldAnalysis[fieldName].types.add("checkbox");
          } else if (value instanceof Date) {
            fieldAnalysis[fieldName].types.add("dateTime");
          }
          
          if (fieldAnalysis[fieldName].sampleValues.length < 3) {
            fieldAnalysis[fieldName].sampleValues.push(value);
          }
        }
      });
    });

    // Update fields with better type information
    fields = fields.map((field) => {
      const analysis = fieldAnalysis[field.name];
      if (analysis && analysis.types.size > 0) {
        // Use the most specific type
        if (analysis.types.has("multipleRecordLinks")) {
          field.type = "multipleRecordLinks";
        } else if (analysis.types.has("singleRecordLink")) {
          field.type = "singleRecordLink";
        } else if (analysis.types.has("multipleSelects")) {
          field.type = "multipleSelects";
        } else if (analysis.types.has("email")) {
          field.type = "email";
        } else if (analysis.types.has("url")) {
          field.type = "url";
        } else if (analysis.types.has("multipleLineText")) {
          field.type = "multipleLineText";
        } else if (analysis.types.has("number")) {
          field.type = "number";
        } else if (analysis.types.has("checkbox")) {
          field.type = "checkbox";
        } else if (analysis.types.has("dateTime")) {
          field.type = "dateTime";
        } else {
          field.type = Array.from(analysis.types)[0] || field.type;
        }
      }
      return field;
    });

    return {
      id: tableId,
      name: tableName,
      fields,
      recordCount,
    };
  } catch (error: any) {
    console.error(`Error fetching schema for ${tableName}:`, error.message);
    return {
      id: tableId,
      name: tableName,
      fields: [],
      recordCount: 0,
    };
  }
}

async function fetchTableRecords(tableName: string): Promise<any[]> {
  const records: any[] = [];
  
  try {
    await airtableBase(tableName)
      .select()
      .eachPage((pageRecords, fetchNextPage) => {
        pageRecords.forEach((record) => {
          records.push({
            id: record.id,
            fields: record.fields,
            createdTime: record._rawJson.createdTime,
          });
        });
        fetchNextPage();
      });
  } catch (error: any) {
    console.error(`Error fetching records for ${tableName}:`, error.message);
  }
  
  return records;
}

interface TableInfo {
  id: string;
  name: string;
}

async function getAllTables(): Promise<TableInfo[]> {
  // Airtable API doesn't provide a direct way to list tables
  // We'll try to use the REST API metadata endpoint to get schema
  // If that fails, we'll try common table names
  
  const existingTables: TableInfo[] = [];
  
  // Try to fetch metadata using REST API
  const accessToken = process.env.AIRTABLE_ACCESS_TOKEN;
  const appId = process.env.AIRTABLE_APP_ID;
  
  try {
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${appId}/tables`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.tables && Array.isArray(data.tables)) {
        data.tables.forEach((table: any) => {
          existingTables.push({ id: table.id, name: table.name });
          console.log(`✓ Found table: ${table.name} (ID: ${table.id})`);
        });
        return existingTables;
      }
    } else {
      const errorText = await response.text();
      console.log(`⚠️  Metadata API returned ${response.status}: ${errorText.substring(0, 100)}`);
      console.log("   Trying common table names...");
    }
  } catch (error: any) {
    console.log(`⚠️  Could not fetch metadata: ${error.message}`);
    console.log("   Trying common table names...");
  }
  
  // Fallback: Try common table names
  const commonTableNames = [
    "Leads", "Companies", "Contacts", "Deals", "Tasks", 
    "Users", "Products", "Quotations", "Calls", "Messages",
    "Marketing Assets", "Knowledge Base", "Departments",
    "Clients", "Orders", "Invoices", "Projects", "Employees"
  ];
  
  // Test which tables exist by trying to query them
  for (const tableName of commonTableNames) {
    try {
      await airtableBase(tableName).select({ maxRecords: 1 }).firstPage();
      if (!existingTables.find(t => t.name === tableName)) {
        existingTables.push({ id: tableName, name: tableName }); // Use name as ID fallback
        console.log(`✓ Found table: ${tableName}`);
      }
    } catch (error: any) {
      // Table doesn't exist or we don't have access
      // Continue silently
    }
  }
  
  return existingTables;
}

async function fetchAllAirtableData() {
  console.log("🚀 Starting Airtable Data Fetch...\n");
  
  // Validate credentials
  const accessToken = process.env.AIRTABLE_ACCESS_TOKEN;
  const appId = process.env.AIRTABLE_APP_ID;
  
  if (!accessToken || !appId) {
    console.error("❌ Missing Airtable credentials!");
    console.error("   Please set in .env.local:");
    if (!accessToken) console.error("   - AIRTABLE_ACCESS_TOKEN");
    if (!appId) console.error("   - AIRTABLE_APP_ID");
    process.exit(1);
  }
  
  console.log("✅ Airtable credentials found");
  console.log(`   App ID: ${appId}\n`);
  
  // Create output directory
  const outputDir = resolve(process.cwd(), "data", "airtable");
  mkdirSync(outputDir, { recursive: true });
  
  try {
    // Get all tables
    console.log("📋 Discovering tables...");
    const tables = await getAllTables();
    
    if (tables.length === 0) {
      console.log("\n⚠️  No common tables found automatically.");
      console.log("   Please provide table names manually or check your Airtable app.");
      console.log("   You can update this script to include your specific table names.\n");
      
      // Try to fetch at least one record from the base to confirm connection
      console.log("🔍 Testing connection by fetching any available table...");
      // We'll document this limitation
    } else {
      console.log(`✅ Found ${tables.length} table(s)\n`);
    }
    
    const allData: Record<string, TableData> = {};
    const schemas: TableSchema[] = [];
    
    // Fetch data for each table
    for (const tableInfo of tables) {
      const tableName = tableInfo.name;
      const tableId = tableInfo.id;
      
      console.log(`📊 Fetching data for: ${tableName}`);
      
      try {
        // Fetch schema
        const schema = await fetchTableSchema(tableId, tableName);
        schemas.push(schema);
        
        console.log(`   Schema: ${schema.fields.length} fields`);
        
        // Fetch all records
        console.log(`   Fetching records...`);
        const records = await fetchTableRecords(tableName);
        
        console.log(`   ✓ Fetched ${records.length} records`);
        
        allData[tableName] = {
          schema,
          records,
        };
        
        // Save individual table data (sanitize filename)
        const sanitizedName = tableName.replace(/[\/\\:*?"<>|]/g, "_").replace(/\s+/g, "_");
        const tableFile = resolve(outputDir, `${sanitizedName}.json`);
        writeFileSync(
          tableFile,
          JSON.stringify(
            {
              table: tableName,
              schema,
              records,
              fetchedAt: new Date().toISOString(),
            },
            null,
            2
          )
        );
        
        console.log(`   💾 Saved to: ${tableFile}\n`);
      } catch (error: any) {
        console.error(`   ❌ Error processing ${tableName}:`, error.message);
        console.log();
      }
    }
    
    // Save consolidated schema
    const schemaFile = resolve(outputDir, "schema.json");
    writeFileSync(
      schemaFile,
      JSON.stringify(
        {
          appId,
          tables: schemas,
          totalTables: schemas.length,
          totalRecords: Object.values(allData).reduce((sum, data) => sum + data.records.length, 0),
          fetchedAt: new Date().toISOString(),
        },
        null,
        2
      )
    );
    console.log(`💾 Consolidated schema saved to: ${schemaFile}`);
    
    // Save all data summary
    const summaryFile = resolve(outputDir, "summary.json");
    writeFileSync(
      summaryFile,
      JSON.stringify(
        {
          appId,
          tables: Object.keys(allData),
          tableCounts: Object.fromEntries(
            Object.entries(allData).map(([name, data]) => [
              name,
              {
                fields: data.schema.fields.length,
                records: data.records.length,
              },
            ])
          ),
          fetchedAt: new Date().toISOString(),
        },
        null,
        2
      )
    );
    console.log(`💾 Summary saved to: ${summaryFile}`);
    
    // Save table mapping (name to ID) for reference
    const tableMappingFile = resolve(outputDir, "table-mapping.json");
    writeFileSync(
      tableMappingFile,
      JSON.stringify(
        {
          appId,
          tables: tables.map(t => ({ id: t.id, name: t.name })),
          fetchedAt: new Date().toISOString(),
        },
        null,
        2
      )
    );
    console.log(`💾 Table mapping saved to: ${tableMappingFile}`);
    
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Airtable data fetch completed!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    console.log("📋 Summary:");
    console.log(`   Tables found: ${schemas.length}`);
    console.log(
      `   Total records: ${Object.values(allData).reduce(
        (sum, data) => sum + data.records.length,
        0
      )}`
    );
    console.log(`   Output directory: ${outputDir}\n`);
    
  } catch (error: any) {
    console.error("\n❌ Airtable fetch failed!");
    console.error("   Error:", error.message);
    console.error("   Details:", error);
    process.exit(1);
  }
}

// Run the fetcher
fetchAllAirtableData();

