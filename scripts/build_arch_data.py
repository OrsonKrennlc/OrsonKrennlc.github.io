import os
import csv
import json
import math

# --- Coordinate Conversion Functions (GCJ-02 to WGS-84) ---
PI = 3.1415926535897932384626
ee = 0.00669342162296594323
a = 6378245.0

def _transform_lat(x, y):
    ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * math.sqrt(abs(x))
    ret += (20.0 * math.sin(6.0 * x * PI) + 20.0 * math.sin(2.0 * x * PI)) * 2.0 / 3.0
    ret += (20.0 * math.sin(y * PI) + 40.0 * math.sin(y / 3.0 * PI)) * 2.0 / 3.0
    ret += (160.0 * math.sin(y / 12.0 * PI) + 320 * math.sin(y * PI / 30.0)) * 2.0 / 3.0
    return ret

def _transform_lon(x, y):
    ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * math.sqrt(abs(x))
    ret += (20.0 * math.sin(6.0 * x * PI) + 20.0 * math.sin(2.0 * x * PI)) * 2.0 / 3.0
    ret += (20.0 * math.sin(x * PI) + 40.0 * math.sin(x / 3.0 * PI)) * 2.0 / 3.0
    ret += (150.0 * math.sin(x / 12.0 * PI) + 300.0 * math.sin(x / 30.0 * PI)) * 2.0 / 3.0
    return ret

def out_of_china(lng, lat):
    return not (lng > 73.66 and lng < 135.05 and lat > 3.86 and lat < 53.55)

def gcj02_to_wgs84(lng, lat):
    if out_of_china(lng, lat):
        return lng, lat
    dlat = _transform_lat(lng - 105.0, lat - 35.0)
    dlng = _transform_lon(lng - 105.0, lat - 35.0)
    radlat = lat / 180.0 * PI
    magic = math.sin(radlat)
    magic = 1 - ee * magic * magic
    sqrtmagic = math.sqrt(magic)
    dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI)
    dlng = (dlng * 180.0) / (a / sqrtmagic * math.cos(radlat) * PI)
    mglat = lat + dlat
    mglng = lng + dlng
    return lng * 2 - mglng, lat * 2 - mglat
# ---------------------------------------------------------
def get_files_in_dir(path):
    try:
        files = os.listdir(path)
        # Sort files so images appear in order
        return sorted([f for f in files if os.path.isfile(os.path.join(path, f)) and not f.startswith('.')])
    except:
        return []

def read_csv(path):
    # Try different encodings
    for enc in ['utf-8', 'gbk', 'gb2312', 'utf-8-sig']:
        try:
            with open(path, 'r', encoding=enc) as f:
                reader = csv.reader(f)
                return list(reader)
        except Exception:
            continue
    return []

def main():
    base_dir = os.path.join(os.path.dirname(__file__), '..', 'assets', 'arch')
    base_dir = os.path.abspath(base_dir)
    
    if not os.path.exists(base_dir):
        print(f"Directory {base_dir} does not exist.")
        return

    projects = []

    # Iterate over subdirectories in assets/arch
    for folder_name in sorted(os.listdir(base_dir)):
        folder_path = os.path.join(base_dir, folder_name)
        if not os.path.isdir(folder_path):
            continue
            
        csv_path = os.path.join(folder_path, 'context.csv')
        pic_dir = os.path.join(folder_path, 'pic')
        
        if not os.path.exists(csv_path):
            continue
            
        rows = read_csv(csv_path)
        if not rows:
            print(f"Could not read or empty CSV for {folder_name}")
            continue

        # Map rows to dictionary fields
        project = {
            'id': folder_name,
            'title': '',
            'subtitle': '',
            'time': '',
            'location': '',
            'coords': [0, 0],
            'type': '',
            'area': '',
            'far': '',
            'greening': '',
            'designer': '',
            'description': '',
            'images': []
        }

        # Based on key matching
        desc_lines = []
        for i, row in enumerate(rows):
            if len(row) == 0: continue
            
            key = row[0].strip()
            val = row[1].strip() if len(row) > 1 else ""
            
            if "名称" in key or "项目" == key: project['title'] = val
            elif "副标题" in key: project['subtitle'] = val
            elif "时间" in key: project['time'] = val
            elif "位置" in key or "地点" in key: project['location'] = val
            elif "坐标" in key:
                if len(row) >= 3:
                    try:
                        lng, lat = float(row[1]), float(row[2])
                        wgs_lng, wgs_lat = gcj02_to_wgs84(lng, lat)
                        project['coords'] = [wgs_lat, wgs_lng]
                    except: pass
                else:
                    parts = val.split(',')
                    if len(parts) >= 2:
                        try:
                            lng, lat = float(parts[0]), float(parts[1])
                            wgs_lng, wgs_lat = gcj02_to_wgs84(lng, lat)
                            project['coords'] = [wgs_lat, wgs_lng]
                        except: pass
            elif "功能" in key or "类型" in key: project['type'] = val
            elif "面积" in key: project['area'] = val
            elif "容积率" in key: project['far'] = val
            elif "绿地" in key or "绿化" in key: project['greening'] = val
            elif "设计" in key or "人员" in key: project['designer'] = val
            elif "文本" in key or "描述" in key or len(desc_lines) > 0 or i > 8:
                if "文本" in key or "描述" in key:
                    if len(row) > 1:
                        desc_lines.append(','.join(row[1:]).strip())
                else:
                    if len(row) > 0:
                        desc_lines.append(','.join(row).strip())
                    
        # Fallback for first two rows if title/subtitle not matched properly
        if not project['title'] and len(rows) > 0 and len(rows[0]) > 1:
            project['title'] = rows[0][1]
        if not project['subtitle'] and len(rows) > 1 and len(rows[1]) > 1:
            project['subtitle'] = rows[1][1]
            
        project['description'] = '\n\n'.join(desc_lines)
            
        # Get images
        images = get_files_in_dir(pic_dir)
        project['images'] = [f"assets/arch/{folder_name}/pic/{img}" for img in images]
        
        projects.append(project)

    output_path = os.path.join(base_dir, 'projectsData.js')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('window.ARCH_PROJECTS = ')
        json.dump(projects, f, ensure_ascii=False, indent=2)
        f.write(';\n')
        
    print(f"Generated {output_path} with {len(projects)} projects.")

if __name__ == "__main__":
    main()
