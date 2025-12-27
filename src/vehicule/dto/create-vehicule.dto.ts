import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger"
import {Statut, TypeVehicule} from "@prisma/client"

export class CreateVehiculeDto {
    @ApiProperty(
        {example:"Renault Kangoo", description:"Nom du vehicule"}
    )
    @IsString()
    @IsNotEmpty()

    nom:string

    @ApiProperty(
        {example:"123-ABC-45", description:"Numero de plaque du vehicule"}
    )
    @IsString()
    @IsNotEmpty()

    numero_de_plaque:string

    @ApiProperty(
        {example:"2020", description:"Annee du vehicule"}
    )
    @IsNumber()
    @IsNotEmpty()
    annee:number
    @ApiProperty(
        {example:"CAR", description:"Type du vehicule"}
    )
    @IsString()
    @IsNotEmpty()


    type :TypeVehicule
    @ApiProperty(
        {example:"Clio 4", description:"Modele du vehicule"}
    )
    @IsString()
    @IsNotEmpty()

    modele:string
    @ApiProperty(
        {example:"ACTIVE", description:"Statut du vehicule"}
    )
    @IsString()
    @IsNotEmpty()

    statut:Statut
}
