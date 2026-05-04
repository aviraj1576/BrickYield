import mysql.connector
 
DB_CONFIG = {
    "host":     "localhost",
    "user":     "root",
    "password": "sarabha3",  
    "database": "brickyield",
}
 
def get_connection():
    return mysql.connector.connect(**DB_CONFIG)
 
def query(sql, params=(), fetch=True):
    conn = get_connection()
    cur  = conn.cursor(dictionary=True)
    cur.execute(sql, params)
    if fetch:
        result = cur.fetchall()
    else:
        conn.commit()
        result = {"affected_rows": cur.rowcount}
    cur.close()
    conn.close()
    return result
 
def call_proc(name, args):
    """Call a stored procedure and return all result sets."""
    conn = get_connection()
    cur  = conn.cursor(dictionary=True)
    cur.callproc(name, args)
    results = [list(r.fetchall()) for r in cur.stored_results()]
    cur.close()
    conn.close()
    return results