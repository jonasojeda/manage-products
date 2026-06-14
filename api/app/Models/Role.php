<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int        $id
 * @property string     $name
 * @property string     $guard_name
 * @property int        $deleted_at
 * @property int        $created_at
 * @property int        $updated_at
 */

class Role extends Model
{
    use HasFactory, SoftDeletes;
    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $table = 'roles';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'id';

    /**
     * Attributes that should be mass-assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'guard_name',
        'deleted_at',
        'created_at',
        'updated_at'
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = [];

    /**
     * The attributes that should be casted to native types.
     *
     * @var array
     */
    protected $casts = [
        'name' => 'string',
        'guard_name' => 'string',
        'deleted_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Indicates if the model should be timestamped.
     *
     * @var boolean
     */
    public $timestamps = true;

    use SoftDeletes;
    public $softDelete = true;

    //Accessors
    //

    //Mutators
    public function setNameAttribute($value)
    {
        $this->attributes['name'] = ucfirst(trim($value));
    }

    //Funciones publicas
    public function obtenerObjDatos(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'creado' => $this->created_at,
        ];
    }

    //Relaciones
    public function ModelHasRoles()
    {
        return $this->hasMany('App\Models\ModelHasRoles', 'rol_id', 'id');
    }
}
