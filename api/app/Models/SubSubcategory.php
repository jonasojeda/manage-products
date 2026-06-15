<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubSubcategory extends Model
{
    use HasFactory;

    protected $table = 'sub_subcategories';

    protected $fillable = ['subcategory_id', 'name'];

    public function subcategory()
    {
        return $this->belongsTo(Subcategory::class);
    }
}
