<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'sku',
        'name',
        'brand_id',
        'category_id',
        'subcategory_id',
        'sub_subcategory_id',
        'price',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            if (empty($product->sku)) {
                $product->sku = self::generateUniqueSku();
            }
        });
    }

    public static function generateUniqueSku()
    {
        $latestSkus = self::where('sku', 'like', 'SKU-%')
            ->pluck('sku')
            ->toArray();

        $maxNumber = 999;
        foreach ($latestSkus as $sku) {
            $numberPart = substr($sku, 4);
            if (is_numeric($numberPart)) {
                $num = (int)$numberPart;
                if ($num > $maxNumber) {
                    $maxNumber = $num;
                }
            }
        }

        $newNumber = $maxNumber + 1;

        while (self::where('sku', "SKU-{$newNumber}")->exists()) {
            $newNumber++;
        }

        return "SKU-{$newNumber}";
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function subcategory()
    {
        return $this->belongsTo(Subcategory::class);
    }

    public function subSubcategory()
    {
        return $this->belongsTo(SubSubcategory::class, 'sub_subcategory_id');
    }
}
