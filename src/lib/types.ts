
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      images: {
        Row: {
          created_at: string
          id: number
          name: string
          testing_center: number
          thumbnail: boolean
          url: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          testing_center: number
          thumbnail?: boolean
          url: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          testing_center?: number
          thumbnail?: boolean
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "images_testing_center_fkey"
            columns: ["testing_center"]
            isOneToOne: false
            referencedRelation: "testing_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "images_testing_center_fkey"
            columns: ["testing_center"]
            isOneToOne: false
            referencedRelation: "testing_centers_with_review_counts"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          barangay: string
          city: string
          id: number
          landmark: string
          province: string
          region: string
          testing_center: number
          zip: number
        }
        Insert: {
          barangay: string
          city: string
          id?: number
          landmark: string
          province: string
          region: string
          testing_center: number
          zip: number
        }
        Update: {
          barangay?: string
          city?: string
          id?: number
          landmark?: string
          province?: string
          region?: string
          testing_center?: number
          zip?: number
        }
        Relationships: [
          {
            foreignKeyName: "location_testing_center_fkey"
            columns: ["testing_center"]
            isOneToOne: true
            referencedRelation: "testing_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_testing_center_fkey"
            columns: ["testing_center"]
            isOneToOne: true
            referencedRelation: "testing_centers_with_review_counts"
            referencedColumns: ["id"]
          },
        ]
      }
      open_hours: {
        Row: {
          close_time: string | null
          day: Database["public"]["Enums"]["day_enum"] | null
          id: number
          open_time: string | null
          testing_center: number
        }
        Insert: {
          close_time?: string | null
          day?: Database["public"]["Enums"]["day_enum"] | null
          id?: number
          open_time?: string | null
          testing_center: number
        }
        Update: {
          close_time?: string | null
          day?: Database["public"]["Enums"]["day_enum"] | null
          id?: number
          open_time?: string | null
          testing_center?: number
        }
        Relationships: [
          {
            foreignKeyName: "open_hours_testing_center_fkey"
            columns: ["testing_center"]
            isOneToOne: false
            referencedRelation: "testing_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "open_hours_testing_center_fkey"
            columns: ["testing_center"]
            isOneToOne: false
            referencedRelation: "testing_centers_with_review_counts"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          author: string
          created_at: string
          id: number
          rating: number
          testing_center: number
          text: string
        }
        Insert: {
          author?: string
          created_at?: string
          id?: number
          rating: number
          testing_center: number
          text: string
        }
        Update: {
          author?: string
          created_at?: string
          id?: number
          rating?: number
          testing_center?: number
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_testing_center_fkey"
            columns: ["testing_center"]
            isOneToOne: false
            referencedRelation: "testing_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_testing_center_fkey"
            columns: ["testing_center"]
            isOneToOne: false
            referencedRelation: "testing_centers_with_review_counts"
            referencedColumns: ["id"]
          },
        ]
      }
      testing_centers: {
        Row: {
          contact: number
          created_at: string
          deactivated: boolean
          facebook: string
          google_map: string | null
          id: number
          name: string
          owner: string
          services: string
          status:
            | Database["public"]["Enums"]["testing_center_status_enum"]
            | null
        }
        Insert: {
          contact: number
          created_at?: string
          deactivated?: boolean
          facebook: string
          google_map?: string | null
          id?: number
          name: string
          owner?: string
          services: string
          status?:
            | Database["public"]["Enums"]["testing_center_status_enum"]
            | null
        }
        Update: {
          contact?: number
          created_at?: string
          deactivated?: boolean
          facebook?: string
          google_map?: string | null
          id?: number
          name?: string
          owner?: string
          services?: string
          status?:
            | Database["public"]["Enums"]["testing_center_status_enum"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "testing_centers_owner_fkey1"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          deactivated: boolean
          email: string
          full_name: string
          id: string
          image: string | null
          user_role: Database["public"]["Enums"]["user_role_enum"] | null
        }
        Insert: {
          created_at?: string
          deactivated?: boolean
          email: string
          full_name: string
          id?: string
          image?: string | null
          user_role?: Database["public"]["Enums"]["user_role_enum"] | null
        }
        Update: {
          created_at?: string
          deactivated?: boolean
          email?: string
          full_name?: string
          id?: string
          image?: string | null
          user_role?: Database["public"]["Enums"]["user_role_enum"] | null
        }
        Relationships: []
      }
    }
    Views: {
      testing_centers_with_review_counts: {
        Row: {
          contact: number | null
          created_at: string | null
          deactivated: boolean | null
          facebook: string | null
          google_map: string | null
          id: number | null
          name: string | null
          owner: string | null
          review_count: number | null
          services: string | null
          status:
            | Database["public"]["Enums"]["testing_center_status_enum"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "testing_centers_owner_fkey1"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      getaverage: {
        Args: {
          labid: number
        }
        Returns: {
          avg_rating: number
          rating_count: number
        }[]
      }
      search_location: {
        Args: {
          keyword: string
        }
        Returns: {
          contact: number
          created_at: string
          deactivated: boolean
          facebook: string
          google_map: string | null
          id: number
          name: string
          owner: string
          services: string
          status:
            | Database["public"]["Enums"]["testing_center_status_enum"]
            | null
        }[]
      }
    }
    Enums: {
      day_enum:
        | "monday"
        | "tuesday"
        | "wednesday"
        | "thursday"
        | "friday"
        | "saturday"
        | "sunday"
      testing_center_status_enum:
        | "pending"
        | "accepted"
        | "rejected"
        | "deleted"
      user_role_enum: "user" | "testing_center" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          start_after?: string
          next_token?: string
        }
        Returns: {
          name: string
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
