import sqlite3
import csv

def import_csv_to_databse(csv_file):

    try: 
        sqliteConnection = sqlite3.connect('database.db')
        cursor = sqliteConnection.cursor()
        print("Successfully Connected to SQlite")


        with open(csv_file, mode='r') as file:
            csv_reader = csv.reader(file)
            header = next(csv_reader)
            sqlite_insert_query = """INSERT INTO Computer_Part(part_name, brand, size, date_posted, unit_price, slug) VALUES (?, ?, ?, ?, ?, ?)"""

            for row in csv_reader: 
                cursor.execute(sqlite_insert_query, row)


        sqliteConnection.commit()
        print("Record of {cursor.rowcount} inserted successfully into SqliteDb_developers table", cursor.rowcount); 
        cursor.close()

    except sqlite3.Error as error:
        if "database is locked" in str(error):
                print("Database is locked. Retrying...")
                retries -= 1
                time.sleep(2)  # Wait 2 seconds before retrying
        else:
            print("Failed to insert data into SQLite table", error)
    finally:
        if sqliteConnection: 
            sqliteConnection.close()
            print("The SQLite connection is closed")


import_csv_to_databse('computer_part.csv')
        