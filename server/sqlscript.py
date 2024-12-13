import sqlite3


try: 
    sqliteConnection = sqlite3.connect('database.db')
    cursor = sqliteConnection.cursor()
    print("Successfully Connected to SQlite")
    sqlite_insert_query = """INSERT INTO Computer_Part(part_name, brand, date_posted, unit_price, slug, size) VALUES (?, ?, ?, ?, ?, ?)"""
    
    part_name = "example"
    brand = "example"
    date_posted = "2024-12-13"
    unit_price = 159.99
    slug = ""
    size = "medium"

    count = cursor.execute(sqlite_insert_query, (part_name, brand, date_posted, unit_price, slug, size))
    sqliteConnection.commit()
    print("Record inserted successfully into SqliteDb_developers table", cursor.rowcount); 
    cursor.close()

except sqlite3.Error as error:
    print("Failed to insert data into sqlite table", error)
finally:
    if sqliteConnection: 
        sqliteConnection.close()
        print("The SQLite connection is closed")
    