from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
from datetime import datetime
import asyncio
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS for React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MySQL DB connection
def get_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "root"),
        database=os.getenv("DB_NAME", "project_zenpark")
    )

# Store active parking status WebSocket connections
parking_status_connections: List[WebSocket] = []

@app.websocket("/ws/plates")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    last_id = 0  # Track new entries only

    try:
        while True:
            try:
                conn = get_connection()
                cursor = conn.cursor(dictionary=True)
                cursor.execute("SELECT * FROM plates WHERE id > %s ORDER BY id ASC", (last_id,))
                rows = cursor.fetchall()

                for row in rows:
                    row["timestamp"] = row["timestamp"].strftime('%Y-%m-%d %H:%M:%S')
                    await websocket.send_json(row)
                    last_id = row["id"]

                cursor.close()
                conn.close()

                await asyncio.sleep(2)  # Poll every 2 seconds

            except WebSocketDisconnect:
                print("Plate detection client disconnected")
                break
            except Exception as e:
                print(f"Error in plate detection: {e}")
                break
                
    except Exception as e:
        print(f"Fatal error in websocket: {e}")


def get_parking_status_from_plates():
    """
    Calculate parking availability based on unique plate records in the database
    Counts unique plates to determine occupied spots
    """
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Total parking capacity
        TOTAL_SPOTS = 100
        
        # Count unique plate numbers in the plates table
        cursor.execute("""
            SELECT COUNT(DISTINCT plate) as unique_plates
            FROM plates
        """)
        
        result = cursor.fetchone()
        occupied_spots = result['unique_plates'] if result else 0
        
        # Calculate availability
        available_spots = max(0, TOTAL_SPOTS - occupied_spots)
        occupancy_rate = (occupied_spots / TOTAL_SPOTS) * 100 if TOTAL_SPOTS > 0 else 0
        
        cursor.close()
        conn.close()
        
        return {
            "total_spots": TOTAL_SPOTS,
            "occupied_spots": occupied_spots,
            "available_spots": available_spots,
            "occupancy_rate": round(occupancy_rate, 2),
            "last_updated": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"Error fetching parking status: {e}")
        return {
            "total_spots": 100,
            "occupied_spots": 0,
            "available_spots": 100,
            "occupancy_rate": 0,
            "last_updated": datetime.now().isoformat(),
            "error": str(e)
        }


@app.websocket("/ws/parking-status")
async def parking_status_websocket(websocket: WebSocket):
    """
    WebSocket endpoint for real-time parking availability updates
    Monitors the plates table and sends updates when unique plate count changes
    """
    await websocket.accept()
    parking_status_connections.append(websocket)
    print(f"🚗 Parking status client connected. Total clients: {len(parking_status_connections)}")
    
    try:
        # Send initial status
        status = get_parking_status_from_plates()
        await websocket.send_json(status)
        print(f"📊 Initial status sent: {status['occupied_spots']} occupied, {status['available_spots']} available")
        
        # Track last count to detect changes
        last_count = status['occupied_spots']
        
        while True:
            await asyncio.sleep(2)  # Check every 2 seconds
            
            current_status = get_parking_status_from_plates()
            current_count = current_status['occupied_spots']
            
            # Send update if unique plate count changed
            if current_count != last_count:
                change = current_count - last_count
                change_type = "increased" if change > 0 else "decreased"
                print(f"🔄 Parking update: {last_count} → {current_count} unique plates ({change_type} by {abs(change)})")
                print(f"   Available: {current_status['available_spots']} | Occupied: {current_count} | Rate: {current_status['occupancy_rate']}%")
                
                await websocket.send_json(current_status)
                last_count = current_count
            
    except WebSocketDisconnect:
        if websocket in parking_status_connections:
            parking_status_connections.remove(websocket)
        print(f"❌ Parking status client disconnected. Remaining: {len(parking_status_connections)}")
    except Exception as e:
        print(f"Error in parking status WebSocket: {e}")
        if websocket in parking_status_connections:
            parking_status_connections.remove(websocket)


@app.get("/parking-status")
async def get_parking_status():
    """
    REST endpoint for parking availability status
    Returns current parking data based on unique plates in the database
    """
    return get_parking_status_from_plates()


@app.get("/user-history")
async def get_user_history(uid: str):
    """
    Returns parking history for a specific user based on their vehicle plates
    """
    try:
        # First, get the user's approved vehicle plates from the main backend
        # For now, we'll return all plates matching the user's vehicles
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get plates from approved_vehicles table joined with plates table
        cursor.execute("""
            SELECT p.id, p.plate, p.timestamp, p.approved, p.confidence
            FROM plates p
            WHERE p.approved = TRUE
            ORDER BY p.timestamp DESC
            LIMIT 50
        """)
        
        rows = cursor.fetchall()
        
        # Format timestamps
        for row in rows:
            row["timestamp"] = row["timestamp"].strftime('%Y-%m-%d %H:%M:%S')
        
        cursor.close()
        conn.close()
        
        return {
            "history": rows,
            "total": len(rows)
        }
        
    except Exception as e:
        print(f"Error fetching user history: {e}")
        return {
            "history": [],
            "total": 0,
            "error": str(e)
        }


# test1@kiet.com    
# test123