<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    public static $disableCacheFlush = false;

    protected $fillable = [
        'sku',
        'name',
        'ean',
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

        static::saved(function () {
            if (!self::$disableCacheFlush) {
                \Illuminate\Support\Facades\Cache::flush();
            }
        });

        static::deleted(function () {
            \Illuminate\Support\Facades\Cache::flush();
        });
    }

    public static function generateUniqueSku()
    {
        $highestSku = self::where('sku', 'like', 'SKU-%')
            ->orderBy('id', 'desc')
            ->first();

        $maxNumber = 999;
        if ($highestSku) {
            $numberPart = substr($highestSku->sku, 4);
            if (is_numeric($numberPart)) {
                $maxNumber = (int)$numberPart;
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
