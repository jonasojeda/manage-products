<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Subcategory;
use App\Models\SubSubcategory;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $brandNames = [
            "Acme Corp", "Northwind", "Globex", "Initech", "Umbrella", "Hooli", "Stark Industries"
        ];
        
        $brands = [];
        foreach ($brandNames as $name) {
            $brands[] = Brand::create(['name' => $name]);
        }

        $categoriesData = [
            "Electronics" => [
                "Computers" => ["Laptops", "Desktops", "Tablets"],
                "Audio" => ["Headphones", "Speakers", "Microphones"],
                "Mobile" => ["Smartphones", "Accessories"],
            ],
            "Home" => [
                "Furniture" => ["Office Chairs", "Desks", "Shelves"],
                "Kitchen" => ["Cookware", "Appliances"],
            ],
            "Apparel" => [
                "Men" => ["Shirts", "Pants", "Shoes"],
                "Women" => ["Dresses", "Tops", "Shoes"],
            ],
        ];

        $catsMap = [];
        $subcatsMap = [];
        $subsubcatsMap = [];

        foreach ($categoriesData as $catName => $subcategories) {
            $category = Category::create(['name' => $catName]);
            $catsMap[$catName] = $category;

            foreach ($subcategories as $subcatName => $subsubcategories) {
                $subcategory = Subcategory::create([
                    'category_id' => $category->id,
                    'name' => $subcatName
                ]);
                $subcatsMap["$catName > $subcatName"] = $subcategory;

                foreach ($subsubcategories as $subsubcatName) {
                    $subSubcategory = SubSubcategory::create([
                        'subcategory_id' => $subcategory->id,
                        'name' => $subsubcatName
                    ]);
                    $subsubcatsMap["$catName > $subcatName > $subsubcatName"] = $subSubcategory;
                }
            }
        }

        $productNames = [
            "Aurora Pro Laptop", "Nimbus Wireless Headphones", "Vertex Office Chair",
            "Helix Mechanical Keyboard", "Lumen Desk Lamp", "Quartz Smartphone X",
            "Orbit Bluetooth Speaker", "Pulse Fitness Band", "Cascade Coffee Maker",
            "Forge Standing Desk", "Echo Studio Microphone", "Drift Tablet 11",
            "Atlas Backpack", "Beacon Smart Bulb", "Cinder Air Fryer",
            "Delta Running Shoes", "Ember Hoodie", "Flux USB-C Hub",
            "Glide Ergonomic Mouse", "Halo Ring Light",
        ];

        $cats = [
            ["Electronics", "Computers", "Laptops"],
            ["Electronics", "Audio", "Headphones"],
            ["Home", "Furniture", "Office Chairs"],
            ["Electronics", "Computers", "Desktops"],
            ["Home", "Furniture", "Desks"],
            ["Electronics", "Mobile", "Smartphones"],
            ["Electronics", "Audio", "Speakers"],
            ["Apparel", "Men", "Shoes"],
            ["Home", "Kitchen", "Appliances"],
            ["Electronics", "Audio", "Microphones"],
        ];

        foreach ($productNames as $i => $name) {
            $c = $cats[$i % count($cats)];
            $brand = $brands[$i % count($brands)];

            $category = $catsMap[$c[0]];
            $subcategory = $subcatsMap["{$c[0]} > {$c[1]}"];
            $subSubcategory = $subsubcatsMap["{$c[0]} > {$c[1]} > {$c[2]}"];

            Product::create([
                'sku' => "SKU-" . (1000 + $i),
                'ean' => "779" . (1000000000 + $i),
                'name' => $name,
                'brand_id' => $brand->id,
                'category_id' => $category->id,
                'subcategory_id' => $subcategory->id,
                'sub_subcategory_id' => $subSubcategory->id,
                'price' => round((49 + $i * 37.5) * 100) / 100,
                'status' => ($i % 7 === 0 ? "draft" : ($i % 11 === 0 ? "archived" : "active")),
            ]);
        }
    }
}
