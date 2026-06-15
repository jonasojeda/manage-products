<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        // Fill any null ean values with a temporary unique EAN before altering to not nullable
        \DB::table('products')->whereNull('ean')->orWhere('ean', '')->get()->each(function ($product, $index) {
            \DB::table('products')->where('id', $product->id)->update([
                'ean' => 'TEMP-' . time() . '-' . $index
            ]);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('brand_id')->nullable()->change();
            $table->foreignId('category_id')->nullable()->change();
            $table->string('ean')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('brand_id')->nullable(false)->change();
            $table->foreignId('category_id')->nullable(false)->change();
            $table->string('ean')->nullable()->change();
        });
    }
};
