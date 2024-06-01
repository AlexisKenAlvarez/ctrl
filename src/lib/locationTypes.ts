export interface LocationInterface {
  regions: {
    id: number;
    region_code: string;
    psgc_code: string;
    region_name: string;
  }[];
  barangays: {
    brgy_code: string;
    brgy_name: string;
    province_code: string;
    region_code: string;
  }[];
  provinces: {
    province_code: string;
    province_name: string;
    region_code: string;
    psgc_code: string;
  }[];
  cities: {
    city_code: string;
    city_name: string;
    province_code: string;
    desc: string;
  }[];
}