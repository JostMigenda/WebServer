#!/home/jost/py36/bin/python3

from datetime import datetime, timedelta
import cgi
from psycopg2 import connect
from psycopg2.extras import NamedTupleCursor


devices = {"Monitor": "192.168.1.105",
           "Gateway-1": "192.168.1.99",
           "Gateway-2": "192.168.1.100",
           "Switch-1": "192.168.1.170",
           "Switch-2": "192.168.1.182",
           "Switch-3": "192.168.1.183",
           "Switch-4": "192.168.1.184"}


def parse_query_string():
    form = cgi.FieldStorage()
    query_type = form.getfirst("q")

    if query_type == "id":
        row_id = form.getfirst("id", 203)
        query = "SELECT * FROM mon_data where id=%s;"
        args = [row_id]

    elif query_type == "overview":
        query = "SELECT DISTINCT ON (ip) ip, time FROM mon_data WHERE time > %s ORDER BY ip, time DESC;"
        args = [datetime.now() - timedelta(minutes=5, seconds=1)]

    elif query_type == "details":
        device = form.getfirst("device")
        if not device in devices.keys():
            ERROR("Value for argument 'device' not recognized or missing. Try 'pg-query.py?q=details&device=Monitor")

        time_str = form.getfirst("time", "now")
        if time_str == "now":
            from_time = datetime.now() - timedelta(minutes=30)
            to_time = datetime.now()
        elif time_str.endswith("d"):
            from_time = datetime.now() - timedelta(days=int(time_str[:-1]))
            to_time = datetime.now()
        elif time_str.endswith("h"):
            from_time = datetime.now() - timedelta(hours=int(time_str[:-1]))
            to_time = datetime.now()
        elif "to" in time_str:
            from_time, to_time = time_str.split('to', 1)
            from_time = datetime.strptime(from_time, '%Y-%m-%d')
            to_time = datetime.strptime(to_time, '%Y-%m-%d') + timedelta(days=1)  # include all entries on the given day
        else:
            ERROR("Value for argument 'time' not recognized. Try 'time=8h' or 'time=2d' or 'time=2021-02-15to2021-02-18'.")

        query = "SELECT * FROM mon_data WHERE ip=%s and time>%s and time<%s;"
        args = [devices[device], from_time, to_time]

    else:
        ERROR("Value for argument 'q' not recognized or missing. Try 'pg-query.py?q=id&id=1234'.")
    return (query, args)

def execute_query(query, args):
    conn = connect(host="192.168.1.105", user="root", cursor_factory=NamedTupleCursor)
    with conn.cursor() as cur:
        cur.execute(query, args)
        results = cur.fetchall()
    return results

def generate_output(results):
    print("Content-Type: text/plain\n\n")
    for r in results:
        print(r)

def ERROR(msg):
    generate_output(["ERROR: " + msg])
    exit()

if __name__ == "__main__":
    query, args = parse_query_string()
    results = execute_query(query, args)
    generate_output(results)

# Ensure that notes (below) are ignored!
exit()




# execute query
cur.execute("SELECT * FROM mon_data where id='203';")
cur.mogrify("SELECT * FROM mon_data WHERE %s=%s;", ('id', 203))  # return query string without executing

# there are multiple ways to access the results
result = cur.fetchone()
results = cur.fetchall()  # returns list of results
for result in cur:
    print(result)
    # Thanks to `NamedTupleCursor`, result is a named tuple.
    # Use e.g. `result.ip` to access value of the `ip` column.

# get information on the format of the returned result(s)
cur.description
# contains tuple of `Column`s, which are named tuples containing `name`[0] and `type_code`[1]


# Example use cases:
# for DAQ overview page:
#   /pg-query.py?q=overview  # effectively device=all&time=now
# for details page:
#   /pg-query.py?q=details&device=Monitor  # shows last 30 min by default
#   /pg-query.py?q=details&device=Switch-3&time=8h
#   /pg-query.py?q=details&device=RBU-17&time=2021-03-04to2021-03-06

# Transfer all data and let front-end filter out unneeded columns? Or request specific columns in URL?


# to get list of (human-readable) IP addresses (or machine names, or ...)
# "SELECT DISTINCT ip FROM mon_data;"

# >>> cur.mogrify("SELECT ip, time FROM mon_data WHERE time > %s ORDER BY ip, time;", [datetime.now() - timedelta(minutes=10)])  # only entries from last 10 minutes
# b"SELECT ip, time FROM mon_data WHERE time > '2021-03-08T19:10:39.455029'::timestamp ORDER BY ip, time;"
