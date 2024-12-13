import sqlite3
import csv
import os


def update_last_row(row_num, filename='last_row.txt'):
    with open(filename, 'w') as file: 
        file.write(str(row_num))

def get_last_row(filename='last_row.txt'):
    if os.path.exists(filename):
        with open(filename, 'r') as file:
            last_row = file.read().strip()
            return int(last_row) if last_row.isdigit else 0
    return 0
        
def import_csv_to_databse(csv_file):

    last_row = get_last_row()
    print(f"Starting from row {last_row + 1}")

    try: 
        sqliteConnection = sqlite3.connect('database.db')
        cursor = sqliteConnection.cursor()
        print("Successfully Connected to SQlite")


        with open(csv_file, mode='r') as file:
            csv_reader = csv.reader(file)
            header = next(csv_reader)
            row_number = 0

            sqlite_insert_query = """INSERT INTO Computer_Part(part_name, brand, size, date_posted, unit_price, slug, ComponentType, OtherInfo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"""


            cpu_insert_query ="""INSERT INTO Cpu(part_id, cores) VALUES (?, ?)"""
            gpu_insert_query = """INSERT INTO Gpu(part_id, vram) VALUES (?, ?)"""
            motherboard_insert_query = """INSERT INTO Motherboard(part_id, form_factor) VALUES (?, ?)"""
            cooling_insert_query = """INSERT INTO Cooling(part_id, method) VALUES (?, ?)"""
            memory_insert_query =  """INSERT INTO Storage_Device(part_id, memory) VALUES (?, ?)"""
            computer_case_insert_query = """INSERT INTO Computer_case(part_id, size) VALUES (?, ?)"""



            for row in csv_reader: 
                cursor.execute(sqlite_insert_query, row)

                row_number += 1

                if row_number <= last_row: 
                    continue

                part_id = cursor.lastrowid

                component_type = str(row[6])
                
                if component_type.__eq__('GPU'):
                    vram = row[7]
                    cursor.execute(gpu_insert_query, (part_id, vram))
                elif component_type.__eq__('CPU'):
                    cores = row[7]

                    try: 
                        cores = int(cores)
                        cursor.execute(cpu_insert_query, (part_id, cores))
                    except error:
                        print(f"Warning: Invalid cores value for CPU with part_id {part_id}: {cores}")
                        continue 
                elif component_type.__eq__('Motherboard'):
                    form_factor = row[7]
                    cursor.execute(motherboard_insert_query, (part_id, form_factor))
                elif component_type.__eq__('Cooling'):
                    method = row[7]
                    cursor.execute(cooling_insert_query, (part_id, method))
                elif component_type.__eq__('Storage'):
                    memory = row[7]
                    cursor.execute(memory_insert_query, (part_id, memory))
                elif component_type.__eq__('Computer Case'):
                    size = row[7]
                    size = float(size)
                    cursor.execute(computer_case_insert_query, (part_id, size))


                sqliteConnection.commit()
            
            update_last_row(row_number)
            print(f"Processed {row_number} rows.")
            
                    
        
        print(f"Record of {cursor.rowcount} inserted successfully into SqliteDb_developers table", cursor.rowcount); 
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
        